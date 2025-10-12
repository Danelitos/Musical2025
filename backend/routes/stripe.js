const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { enviarEmailConfirmacion } = require('./email');
const router = express.Router();

/**
 * Datos de las sesiones del musical
 * En producción, esto debería venir de una base de datos
 */
const sesiones = [
  {
    id: '1',
    fecha: '2025-12-12',
    hora: '20:00',
    lugar: 'Teatro Salesianos de Deusto (Bilbao)',
    precioAdulto: 5,
    precioNino: 3,
    entradasDisponibles: 550
  },
  {
    id: '2',
    fecha: '2025-12-21',
    hora: '20:00',
    lugar: 'Teatro Salesianos de Deusto (Bilbao)',
    precioAdulto: 5,
    precioNino: 3,
    entradasDisponibles: 550
  }
];

/**
 * POST /api/stripe/create-checkout-session
 * Crea una nueva sesión de Stripe Checkout para procesar el pago
 * 
 * @body {string} customerEmail - Email del cliente
 * @body {string} customerName - Nombre del cliente
 * @body {string} sesionId - ID de la sesión del musical
 * @body {number} numEntradasAdultos - Número de entradas de adultos
 * @body {number} numEntradasNinos - Número de entradas de niños
 * @body {object} sesionInfo - Información de la sesión (fecha, hora, lugar)
 * 
 * @returns {object} { sessionId, url } - ID y URL de la sesión de Stripe
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { 
      customerEmail, 
      customerName, 
      sesionId, 
      numEntradasAdultos = 0,
      numEntradasNinos = 0,
      sesionInfo 
    } = req.body;

    // Validar datos requeridos
    if (!customerEmail || !customerName || !sesionId) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos' 
      });
    }

    // Validar que al menos haya una entrada
    const totalEntradas = numEntradasAdultos + numEntradasNinos;
    if (totalEntradas === 0) {
      return res.status(400).json({ 
        error: 'Debes seleccionar al menos una entrada' 
      });
    }

    // Buscar la sesión seleccionada
    const sesion = sesiones.find(s => s.id === sesionId);
    if (!sesion) {
      return res.status(404).json({ 
        error: 'Sesión no encontrada' 
      });
    }

    // Verificar disponibilidad de entradas
    if (totalEntradas > sesion.entradasDisponibles) {
      return res.status(400).json({ 
        error: `Solo quedan ${sesion.entradasDisponibles} entradas disponibles para esta función`,
        entradasDisponibles: sesion.entradasDisponibles
      });
    }
    
    // Reservar temporalmente las entradas (se confirmarán en el webhook)
    sesion.entradasDisponibles -= totalEntradas;
    console.log(`⏳ Entradas reservadas temporalmente para sesión ${sesionId}. Disponibles: ${sesion.entradasDisponibles}`);

    // Preparar line items para Stripe (solo los que tienen cantidad > 0)
    const lineItems = [];
    
    if (numEntradasAdultos > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Musical "En Belén de Judá" - Entrada Adulto`,
            description: `${sesionInfo.fecha} a las ${sesionInfo.hora} - ${sesionInfo.lugar}`,
          },
          unit_amount: sesion.precioAdulto * 100, // Stripe usa centavos
        },
        quantity: numEntradasAdultos,
      });
    }

    if (numEntradasNinos > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Musical "En Belén de Judá" - Entrada Niño (hasta 14 años)`,
            description: `${sesionInfo.fecha} a las ${sesionInfo.hora} - ${sesionInfo.lugar}`,
          },
          unit_amount: sesion.precioNino * 100, // Stripe usa centavos
        },
        quantity: numEntradasNinos,
      });
    }

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      // Guardar metadata para recuperar después
      metadata: {
        sesionId: sesionId,
        customerName: customerName,
        numEntradasAdultos: numEntradasAdultos.toString(),
        numEntradasNinos: numEntradasNinos.toString(),
        totalEntradas: totalEntradas.toString(),
        sesionFecha: sesionInfo.fecha,
        sesionHora: sesionInfo.hora,
        sesionLugar: sesionInfo.lugar
      },
      success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.CANCEL_URL,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Expira en 30 minutos
    });

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    console.error('❌ Error creando sesión de checkout:', error.message);
    res.status(500).json({ 
      error: 'Error procesando el pago',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/stripe/sesiones
 * Obtiene las sesiones disponibles con entradas actualizadas
 * 
 * @returns {array} Listado de sesiones disponibles
 */
router.get('/sesiones', async (req, res) => {
  try {
    res.json(sesiones);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones:', error.message);
    res.status(500).json({ 
      error: 'Error obteniendo sesiones disponibles' 
    });
  }
});

/**
 * GET /api/stripe/checkout-session/:sessionId
 * Obtiene los detalles de una sesión de checkout completada
 * 
 * @param {string} sessionId - ID de la sesión de Stripe
 * @returns {object} Detalles del pago y metadata
 */
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Recuperar sesión con detalles expandidos
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    if (session.payment_status === 'paid') {
      // Enviar email de confirmación si el pago está completado
      // (Backup si el webhook no funcionó)
      setTimeout(() => {
        enviarEmailConfirmacionAutomatico(session);
      }, 1000);
      
      res.json({
        status: 'success',
        customerEmail: session.customer_email,
        amountTotal: session.amount_total / 100, // Convertir de centavos a euros
        currency: session.currency,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
        lineItems: session.line_items.data
      });
    } else {
      res.json({
        status: 'pending',
        paymentStatus: session.payment_status
      });
    }

  } catch (error) {
    console.error('❌ Error obteniendo sesión:', error.message);
    res.status(500).json({ 
      error: 'Error obteniendo información del pago' 
    });
  }
});

/**
 * POST /api/stripe/webhook
 * Webhook de Stripe para procesar eventos automáticamente
 * Maneja eventos como: checkout.session.completed, payment_intent.succeeded
 * 
 * IMPORTANTE: Este endpoint debe usar express.raw() para verificar firma
 */
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar firma del webhook
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Error en webhook (firma inválida):', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesar evento según tipo
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('✅ Pago completado:', session.id);
      
      // Enviar email de confirmación automáticamente
      enviarEmailConfirmacionAutomatico(session);
      break;
    
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('💰 Pago exitoso:', paymentIntent.id);
      break;

    default:
      // Evento no manejado (normal, Stripe envía muchos tipos)
      if (process.env.NODE_ENV === 'development') {
        console.log(`ℹ️ Evento no manejado: ${event.type}`);
      }
  }

  res.json({received: true});
});

/**
 * GET /api/stripe/sesiones
 * Obtiene el listado de sesiones disponibles
 * 
 * @returns {array} Lista de sesiones con disponibilidad
 */
router.get('/sesiones', (req, res) => {
  res.json(sesiones);
});

/**
 * Función auxiliar: Envía email de confirmación automáticamente
 * Se ejecuta cuando un pago se completa exitosamente
 * 
 * @param {object} session - Objeto de sesión de Stripe Checkout
 */
async function enviarEmailConfirmacionAutomatico(session) {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Iniciando envío de email de confirmación...');
    }
    
    // Extraer datos del metadata de la sesión
    const { 
      customerName, 
      numEntradasAdultos = '0',
      numEntradasNinos = '0',
      totalEntradas,
      sesionFecha, 
      sesionHora, 
      sesionLugar,
      sesionId 
    } = session.metadata;
    
    // Buscar información completa de la sesión
    const sesionInfo = sesiones.find(s => s.id === sesionId);
    
    // Preparar datos para el email
    const datosEmail = {
      email: session.customer_email,
      nombre: customerName,
      sesion: sesionInfo ? {
        fecha: sesionFecha,
        hora: sesionHora,
        lugar: sesionLugar,
        precioAdulto: sesionInfo.precioAdulto,
        precioNino: sesionInfo.precioNino
      } : {
        fecha: sesionFecha,
        hora: sesionHora,
        lugar: sesionLugar,
        precioAdulto: 5,
        precioNino: 3
      },
      numEntradasAdultos: parseInt(numEntradasAdultos),
      numEntradasNinos: parseInt(numEntradasNinos),
      precioTotal: session.amount_total / 100 // Convertir de centavos a euros
    };
    
    // Enviar el email
    await enviarEmailConfirmacion(datosEmail);
    
    console.log('✅ Email de confirmación enviado a:', session.customer_email);
    
    // Actualizar entradas disponibles (en producción usar DB)
    if (sesionInfo) {
      const totalEntradasInt = parseInt(totalEntradas || (parseInt(numEntradasAdultos) + parseInt(numEntradasNinos)));
      sesionInfo.entradasDisponibles -= totalEntradasInt;
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Entradas actualizadas para sesión ${sesionId}. Disponibles: ${sesionInfo.entradasDisponibles}`);
        console.log(`   Adultos: ${numEntradasAdultos}, Niños: ${numEntradasNinos}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error.message);
    // No lanzar error para no fallar el webhook
  }
}

module.exports = router;
