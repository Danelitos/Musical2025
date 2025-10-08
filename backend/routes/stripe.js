const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { enviarEmailConfirmacion } = require('./email');
const router = express.Router();

// Datos de las sesiones (en producción esto vendría de una base de datos)
const sesiones = [
  {
    id: '1',
    fecha: '2025-12-12',
    hora: '20:00',
    lugar: 'Teatro de Deusto (Bilbao)',
    precio: 7,
    entradasDisponibles: 550
  },
  {
    id: '2',
    fecha: '2025-12-21',
    hora: '20:00',
    lugar: 'Teatro de Deusto (Bilbao)',
    precio: 7,
    entradasDisponibles: 550
  }
];

// Crear sesión de checkout de Stripe
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { 
      customerEmail, 
      customerName, 
      sesionId, 
      numEntradas, 
      sesionInfo 
    } = req.body;

    // Validar datos
    if (!customerEmail || !customerName || !sesionId || !numEntradas) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos' 
      });
    }

    // Buscar la sesión
    const sesion = sesiones.find(s => s.id === sesionId);
    if (!sesion) {
      return res.status(404).json({ 
        error: 'Sesión no encontrada' 
      });
    }

    // Verificar disponibilidad
    if (numEntradas > sesion.entradasDisponibles) {
      return res.status(400).json({ 
        error: 'No hay suficientes entradas disponibles' 
      });
    }

    const precioTotal = sesion.precio * numEntradas;

    // Crear sesión de Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Musical "En Belén de Judá"`,
              description: `${sesionInfo.fecha} a las ${sesionInfo.hora} - ${sesionInfo.lugar}`,
            },
            unit_amount: sesion.precio * 100, // Stripe usa centavos
          },
          quantity: numEntradas,
        },
      ],
      metadata: {
        sesionId: sesionId,
        customerName: customerName,
        numEntradas: numEntradas.toString(),
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
    console.error('Error creando sesión de checkout:', error);
    res.status(500).json({ 
      error: 'Error procesando el pago',
      message: error.message 
    });
  }
});

// Obtener detalles de una sesión de checkout
router.get('/checkout-session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    if (session.payment_status === 'paid') {
      // Enviar email de confirmación si el pago está completado
      // (Esto sirve como backup si el webhook no funcionó)
      setTimeout(() => {
        enviarEmailConfirmacionAutomatico(session);
      }, 1000); // Esperar 1 segundo para no bloquear la respuesta
      
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
    console.error('Error obteniendo sesión:', error);
    res.status(500).json({ 
      error: 'Error obteniendo información del pago' 
    });
  }
});

// Webhook para manejar eventos de Stripe
router.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Error en webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
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
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({received: true});
});

// Obtener sesiones disponibles
router.get('/sesiones', (req, res) => {
  res.json(sesiones);
});

// Función para enviar email de confirmación automáticamente
async function enviarEmailConfirmacionAutomatico(session) {
  try {
    console.log('📧 Iniciando envío de email de confirmación...');
    
    // Extraer datos del metadata de la sesión
    const { 
      customerName, 
      numEntradas, 
      sesionFecha, 
      sesionHora, 
      sesionLugar,
      sesionId 
    } = session.metadata;
    
    // Buscar información de la sesión
    const sesionInfo = sesiones.find(s => s.id === sesionId);
    
    // Datos para el email
    const datosEmail = {
      email: session.customer_email,
      nombre: customerName,
      sesion: sesionInfo ? {
        fecha: sesionFecha,
        hora: sesionHora,
        lugar: sesionLugar,
        precio: sesionInfo.precio
      } : {
        fecha: sesionFecha,
        hora: sesionHora,
        lugar: sesionLugar,
        precio: session.amount_total / (parseInt(numEntradas) * 100) // Calcular precio por entrada
      },
      numEntradas: parseInt(numEntradas),
      numeroConfirmacion: session.id.substring(8, 16).toUpperCase(), // Usar parte del session ID
      precioTotal: session.amount_total / 100 // Convertir de centavos a euros
    };
    
    console.log('📧 Datos del email:', datosEmail);
    
    // Enviar el email
    await enviarEmailConfirmacion(datosEmail);
    
    console.log('✅ Email de confirmación enviado exitosamente a:', session.customer_email);
    
    // Opcional: Reducir entradas disponibles
    if (sesionInfo) {
      sesionInfo.entradasDisponibles -= parseInt(numEntradas);
      console.log(`📊 Entradas actualizadas para sesión ${sesionId}. Disponibles: ${sesionInfo.entradasDisponibles}`);
    }
    
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    // No lanzamos el error para que no falle el webhook
  }
}

module.exports = router;
