const express = require('express');
const router = express.Router();

// Inicializar Stripe solo si la clave está disponible
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

if (!stripe) {
  console.error('❌ ADVERTENCIA: STRIPE_SECRET_KEY no configurada - Las rutas de pago no funcionarán');
}

const { enviarEmailConfirmacion } = require('./email');
const { guardarTransaccion, obtenerDisponibilidad } = require('../services/database.service');

/**
 * Configuración de sesiones del musical
 */
const SESIONES_CONFIG = [
  {
    id: '1',
    fecha: '2025-12-12',
    hora: '19:00',
    lugar: 'Teatro Salesianos de Deusto (Bilbao)',
    precioAdulto: 5,
    precioNino: 3,
    capacidadTotal: 550
  },
  {
    id: '2',
    fecha: '2025-12-21',
    hora: '17:00',
    lugar: 'Teatro Salesianos de Deusto (Bilbao)',
    precioAdulto: 5,
    precioNino: 3,
    capacidadTotal: 550
  }
];

/**
 * POST /api/stripe/create-checkout-session
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    // Verificar que Stripe esté disponible
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Servicio de pagos no disponible',
        message: 'Stripe no está configurado correctamente'
      });
    }

    const {  
      customerEmail,
      customerName,
      sesionId,
      numEntradasAdultos = 0,
      numEntradasNinos = 0,
      sesionInfo
    } = req.body;

    // Validaciones
    if (!customerEmail || !customerName || !sesionId) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    const totalEntradas = numEntradasAdultos + numEntradasNinos;
    if (totalEntradas === 0) {
      return res.status(400).json({ error: 'Debes seleccionar al menos una entrada' });
    }

    const sesion = SESIONES_CONFIG.find(s => s.id === sesionId);
    if (!sesion) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }

    // Verificar disponibilidad desde MongoDB
    const disponibles = await obtenerDisponibilidad(sesionId, sesion.capacidadTotal);
    if (totalEntradas > disponibles) {
      return res.status(400).json({
        error: `Solo quedan ${disponibles} entradas disponibles`,
        entradasDisponibles: disponibles
      });
    }

    // Verificar fecha
    const fechaSesion = new Date(sesion.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSesion < hoy) {
      return res.status(400).json({ error: 'No se pueden comprar entradas para sesiones pasadas' });
    }

    // Crear line items
    const lineItems = [];
    
    if (numEntradasAdultos > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Musical "En Belén de Judá" - Entrada Adulto`,
            description: `${sesionInfo.fecha} a las ${sesionInfo.hora} - ${sesionInfo.lugar}`,
          },
          unit_amount: sesion.precioAdulto * 100,
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
          unit_amount: sesion.precioNino * 100,
        },
        quantity: numEntradasNinos,
      });
    }

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      metadata: {
        sesionId: sesionId,
        customerName: customerName,
        numEntradasAdultos: numEntradasAdultos.toString(),
        numEntradasNinos: numEntradasNinos.toString(),
        sesionFecha: sesionInfo.fecha,
        sesionHora: sesionInfo.hora,
        sesionLugar: sesionInfo.lugar
      },
      success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.CANCEL_URL,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60),
      billing_address_collection: 'auto',
      locale: 'es',
      submit_type: 'pay',
    });

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ ERROR creando sesión:', error.message);
    res.status(500).json({
      error: 'Error procesando el pago',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/stripe/sesiones
 */
router.get('/sesiones', async (req, res) => {
  try {
    const sesionesActualizadas = await Promise.all(
      SESIONES_CONFIG.map(async (sesion) => {
        try {
          const disponibilidad = await obtenerDisponibilidad(sesion.id, sesion.capacidadTotal);
          return {
            ...sesion,
            entradasDisponibles: disponibilidad
          };
        } catch (error) {
          // Si falla MongoDB, devolver capacidad total como disponible
          console.warn(`⚠️ No se pudo obtener disponibilidad para sesión ${sesion.id}, usando capacidad total`);
          return {
            ...sesion,
            entradasDisponibles: sesion.capacidadTotal
          };
        }
      })
    );
    
    res.json(sesionesActualizadas);
    
  } catch (error) {
    console.error('❌ Error obteniendo sesiones:', error.message);
    res.status(500).json({ error: 'Error obteniendo sesiones disponibles' });
  }
});

/**
 * GET /api/stripe/checkout-session/:sessionId
 */
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    // Verificar que Stripe esté disponible
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Servicio de pagos no disponible',
        message: 'Stripe no está configurado correctamente'
      });
    }

    const { sessionId } = req.params;

    if (!sessionId || !sessionId.startsWith('cs_')) {
      return res.status(400).json({ error: 'ID de sesión inválido' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    if (session.payment_status === 'paid') {
      res.json({
        status: 'success',
        customerEmail: session.customer_email,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
        lineItems: session.line_items.data
      });
    } else {
      res.json({
        status: session.payment_status === 'unpaid' ? 'pending' : 'unknown',
        paymentStatus: session.payment_status
      });
    }

  } catch (error) {
    console.error('❌ ERROR obteniendo sesión:', error.message);
    
    if (error.type === 'StripeInvalidRequestError' && error.code === 'resource_missing') {
      return res.status(404).json({
        error: 'Sesión no encontrada',
        status: 'expired'
      });
    }
    
    res.status(500).json({ error: 'Error obteniendo información del pago' });
  }
});

/**
 * Procesa el pago completado
 */
async function procesarPagoCompletado(session) {
  try {
    const {
      customerName,
      numEntradasAdultos = '0',
      numEntradasNinos = '0',
      sesionFecha,
      sesionHora,
      sesionLugar,
      sesionId
    } = session.metadata;
    
    const sesionConfig = SESIONES_CONFIG.find(s => s.id === sesionId);
    
    // PASO 1: Guardar en MongoDB PRIMERO para generar ticketId
    const resultadoGuardado = await guardarTransaccion({
      stripeSessionId: session.id,
      stripePaymentIntentId: typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id,
      customerEmail: session.customer_email,
      customerName: customerName,
      sesionId: sesionId,
      sesionFecha: sesionFecha,
      sesionHora: sesionHora,
      sesionLugar: sesionLugar,
      numEntradasAdultos: parseInt(numEntradasAdultos),
      numEntradasNinos: parseInt(numEntradasNinos),
      totalEntradas: parseInt(numEntradasAdultos) + parseInt(numEntradasNinos),
      precioAdulto: sesionConfig?.precioAdulto || 5,
      precioNino: sesionConfig?.precioNino || 3,
      importeTotal: session.amount_total / 100,
      estadoPago: 'paid',
      metadata: {
        stripeMode: session.mode,
        currency: session.currency
      }
    });
    
    console.log(`✅ [WEBHOOK] Transacción guardada en MongoDB - ID: ${resultadoGuardado.insertedId}`);
    
    // PASO 2: Obtener la transacción guardada (con ticketId generado)
    const { obtenerTransaccionPorId } = require('../services/database.service');
    const transaccionGuardada = await obtenerTransaccionPorId(resultadoGuardado.insertedId);
    
    if (!transaccionGuardada || !transaccionGuardada.ticketId) {
      throw new Error('No se pudo obtener el ticketId de la transacción guardada');
    }
    
    console.log(`🎫 [WEBHOOK] Ticket ID generado: ${transaccionGuardada.ticketId}`);
    
    // PASO 3: Enviar email con el ticketId
    await enviarEmailConfirmacion({
      email: session.customer_email,
      nombre: customerName,
      ticketId: transaccionGuardada.ticketId, // ← IMPORTANTE: incluir ticketId
      sesion: {
        fecha: sesionFecha,
        hora: sesionHora,
        lugar: sesionLugar,
        precioAdulto: sesionConfig?.precioAdulto || 5,
        precioNino: sesionConfig?.precioNino || 3
      },
      numEntradasAdultos: parseInt(numEntradasAdultos),
      numEntradasNinos: parseInt(numEntradasNinos),
      precioTotal: session.amount_total / 100
    });
    
    console.log(`✅ [WEBHOOK] Email enviado a ${session.customer_email}`);
    
  } catch (error) {
    console.error(`❌ [WEBHOOK] ERROR procesando pago:`, error.message);
    throw error;
  }
}

/**
 * POST /api/stripe/webhook
 */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  // Verificar que Stripe esté disponible
  if (!stripe) {
    console.error('❌ [WEBHOOK] Stripe no configurado');
    return res.status(503).json({ 
      error: 'Servicio de pagos no disponible'
    });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && process.env.NODE_ENV === 'production') {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = JSON.parse(req.body.toString());
    }

    console.log(`🔔 [WEBHOOK] Evento: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log(`✅ [WEBHOOK] Pago completado - ${session.customer_email}`);
        
        setImmediate(async () => {
          try {
            await procesarPagoCompletado(session);
            console.log(`✅ [WEBHOOK] Procesamiento completo`);
          } catch (error) {
            console.error(`❌ [WEBHOOK] ERROR:`, error.message);
          }
        });
        break;

      default:
        console.log(`ℹ️ [WEBHOOK] Evento no manejado: ${event.type}`);
    }

    res.json({ received: true });

  } catch (err) {
    console.error('❌ [WEBHOOK] ERROR:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
