const express = require('express');
const router = express.Router();

// Validar que la clave de Stripe existe
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ ERROR CRÍTICO: STRIPE_SECRET_KEY no está configurada en las variables de entorno');
  throw new Error('STRIPE_SECRET_KEY no configurada');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { enviarEmailConfirmacion } = require('./email');

/**
 * Datos de las sesiones del musical
 * En producción, esto debería venir de una base de datos con transacciones atómicas
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
 * MANEJO DE RACE CONDITIONS
 * Map para trackear sesiones de Stripe pendientes y reservar entradas temporalmente
 * Clave: sessionId de Stripe
 * Valor: { sesionId, numEntradas, timestamp }
 * 
 * IMPORTANTE: En producción usar Redis o una base de datos con transacciones atómicas
 */
const pendingReservations = new Map();

/**
 * Limpia reservas expiradas (más de 35 minutos)
 * Las sesiones de Stripe expiran en 30 minutos, damos 5 minutos extra de margen
 */
function cleanExpiredReservations() {
  const now = Date.now();
  const expirationTime = 35 * 60 * 1000; // 35 minutos

  for (const [sessionId, reservation] of pendingReservations.entries()) {
    if (now - reservation.timestamp > expirationTime) {
      console.log(`🧹 Limpiando reserva expirada: ${sessionId} (${reservation.numEntradas} entradas)`);
      pendingReservations.delete(sessionId);
    }
  }
}

// Ejecutar limpieza cada 10 minutos
setInterval(cleanExpiredReservations, 10 * 60 * 1000);

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
      console.error('❌ Datos requeridos faltantes:', { customerEmail: !!customerEmail, customerName: !!customerName, sesionId: !!sesionId });
      return res.status(400).json({ 
        error: 'Faltan datos requeridos (email, nombre o sesión)' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      console.error('❌ Email inválido:', customerEmail);
      return res.status(400).json({ 
        error: 'El email proporcionado no es válido' 
      });
    }

    // Validar que al menos haya una entrada
    const totalEntradas = numEntradasAdultos + numEntradasNinos;
    if (totalEntradas === 0) {
      console.error('❌ No se seleccionaron entradas');
      return res.status(400).json({ 
        error: 'Debes seleccionar al menos una entrada' 
      });
    }

    // Validar límite máximo de entradas por compra
    if (totalEntradas > 10) {
      console.error('❌ Excede límite de entradas:', totalEntradas);
      return res.status(400).json({ 
        error: 'Máximo 10 entradas por compra' 
      });
    }

    // Buscar la sesión seleccionada
    const sesion = sesiones.find(s => s.id === sesionId);
    if (!sesion) {
      console.error('❌ Sesión no encontrada:', sesionId);
      return res.status(404).json({ 
        error: 'La sesión seleccionada no está disponible' 
      });
    }

    // CRÍTICO: Verificar disponibilidad de entradas ANTES de crear la sesión
    if (totalEntradas > sesion.entradasDisponibles) {
      console.warn(`⚠️ Intento de compra excede disponibilidad. Solicitadas: ${totalEntradas}, Disponibles: ${sesion.entradasDisponibles}`);
      return res.status(400).json({ 
        error: `Solo quedan ${sesion.entradasDisponibles} entradas disponibles para esta función`,
        entradasDisponibles: sesion.entradasDisponibles
      });
    }

    // PROTECCIÓN CONTRA RACE CONDITIONS
    // Reservar temporalmente las entradas antes de crear la sesión de Stripe
    // Esto previene que múltiples usuarios compren las mismas últimas entradas
    const entradasPrevias = sesion.entradasDisponibles;
    sesion.entradasDisponibles -= totalEntradas;
    console.log(`🔒 Entradas reservadas temporalmente para sesión ${sesionId}: ${totalEntradas}`);
    console.log(`   Disponibles antes: ${entradasPrevias}, Disponibles ahora: ${sesion.entradasDisponibles}`);

    // Verificar que la sesión no esté en el pasado
    const fechaSesion = new Date(sesion.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSesion < hoy) {
      // Devolver las entradas reservadas
      sesion.entradasDisponibles += totalEntradas;
      console.error('❌ Intento de compra para sesión pasada:', sesion.fecha);
      return res.status(400).json({ 
        error: 'No se pueden comprar entradas para sesiones pasadas' 
      });
    }
    
    console.log(`✓ Validaciones completadas. Sesión ${sesionId}. Creando sesión de Stripe...`);


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
      // Configuración adicional de Stripe
      billing_address_collection: 'auto',
      locale: 'es',
      submit_type: 'pay',
    });

    console.log(`✅ Sesión de Stripe creada exitosamente: ${session.id}`);
    console.log(`   URL de checkout: ${session.url}`);
    console.log(`   Expira en: ${new Date(session.expires_at * 1000).toLocaleString('es-ES')}`);

    // Guardar la reserva temporal
    pendingReservations.set(session.id, {
      sesionId: sesionId,
      numEntradas: totalEntradas,
      timestamp: Date.now()
    });
    console.log(`📝 Reserva temporal registrada: ${session.id}`);

    res.json({ 
      sessionId: session.id,
      url: session.url 
    });

  } catch (error) {
    // Si hay error al crear la sesión de Stripe, DEVOLVER las entradas reservadas
    const sesion = sesiones.find(s => s.id === sesionId);
    if (sesion && totalEntradas) {
      sesion.entradasDisponibles += totalEntradas;
      console.log(`🔓 Entradas devueltas por error: ${totalEntradas}. Nueva disponibilidad: ${sesion.entradasDisponibles}`);
    }

    console.error('❌ ERROR CRÍTICO creando sesión de checkout');
    console.error('   Mensaje:', error.message);
    console.error('   Tipo:', error.type || 'Unknown');
    console.error('   Código:', error.code || 'N/A');
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeCardError') {
      return res.status(400).json({ 
        error: 'Error con la tarjeta de crédito',
        message: error.message
      });
    } else if (error.type === 'StripeRateLimitError') {
      return res.status(429).json({ 
        error: 'Demasiadas solicitudes. Por favor, espera un momento e inténtalo de nuevo.'
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        error: 'Solicitud inválida. Verifica los datos ingresados.',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } else if (error.type === 'StripeAPIError') {
      return res.status(500).json({ 
        error: 'Error temporal en el procesador de pagos. Inténtalo de nuevo en unos minutos.'
      });
    } else if (error.type === 'StripeConnectionError') {
      return res.status(503).json({ 
        error: 'No se pudo conectar con el procesador de pagos. Verifica tu conexión.'
      });
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('🚨 ERROR DE AUTENTICACIÓN DE STRIPE - CLAVE API INVÁLIDA');
      return res.status(500).json({ 
        error: 'Error de configuración del servidor. Contacta con soporte.'
      });
    }
    
    // Error genérico
    res.status(500).json({ 
      error: 'Error procesando el pago. Por favor, inténtalo de nuevo.',
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
    console.log('ℹ️ Petición recibida para obtener sesiones');
    
    // Validar que las sesiones existen
    if (!sesiones || sesiones.length === 0) {
      console.warn('⚠️ No hay sesiones disponibles');
      return res.json([]);
    }
    
    console.log(`✅ Retornando ${sesiones.length} sesiones`);
    res.json(sesiones);
  } catch (error) {
    console.error('❌ Error obteniendo sesiones:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: 'Error obteniendo sesiones disponibles',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
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

    if (!sessionId || !sessionId.startsWith('cs_')) {
      console.error('❌ Session ID inválido:', sessionId);
      return res.status(400).json({ 
        error: 'ID de sesión inválido' 
      });
    }

    console.log(`ℹ️ Recuperando sesión de checkout: ${sessionId}`);

    // Recuperar sesión con detalles expandidos
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent']
    });

    console.log(`   Estado del pago: ${session.payment_status}`);
    console.log(`   Email del cliente: ${session.customer_email}`);
    console.log(`   Monto total: ${session.amount_total / 100} EUR`);

    if (session.payment_status === 'paid') {
      console.log('✅ Pago completado');
      console.log('   ℹ️ El email de confirmación será/fue enviado por el webhook');
      
      // NO enviamos email aquí - el webhook lo hace
      // Esto permite responder rápido al frontend
      res.json({
        status: 'success',
        customerEmail: session.customer_email,
        amountTotal: session.amount_total / 100, // Convertir de centavos a euros
        currency: session.currency,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
        lineItems: session.line_items.data
      });
    } else if (session.payment_status === 'unpaid') {
      console.log('⏳ Pago pendiente');
      res.json({
        status: 'pending',
        paymentStatus: session.payment_status,
        message: 'El pago está pendiente de completarse'
      });
    } else {
      console.log(`⚠️ Estado de pago no esperado: ${session.payment_status}`);
      res.json({
        status: 'unknown',
        paymentStatus: session.payment_status
      });
    }

  } catch (error) {
    console.error('❌ ERROR obteniendo sesión de checkout');
    console.error('   Mensaje:', error.message);
    console.error('   Tipo:', error.type || 'Unknown');
    
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'resource_missing') {
        return res.status(404).json({ 
          error: 'Sesión no encontrada. Puede haber expirado.',
          status: 'expired'
        });
      }
      return res.status(400).json({ 
        error: 'Solicitud inválida al recuperar la sesión' 
      });
    } else if (error.type === 'StripeAuthenticationError') {
      console.error('🚨 ERROR DE AUTENTICACIÓN DE STRIPE');
      return res.status(500).json({ 
        error: 'Error de configuración del servidor' 
      });
    }
    
    res.status(500).json({ 
      error: 'Error obteniendo información del pago',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Función auxiliar: Envía email de confirmación automáticamente
 * Se ejecuta cuando un pago se completa exitosamente
 * 
 * @param {object} session - Objeto de sesión de Stripe Checkout
 */
async function enviarEmailConfirmacionAutomatico(session) {
  try {
    console.log('📧 [WEBHOOK] Iniciando envío de email de confirmación...');
    console.log('   Session ID:', session.id);
    console.log('   Customer Email:', session.customer_email);
    
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
    
    console.log('   Metadata:', {
      customerName,
      numEntradasAdultos,
      numEntradasNinos,
      sesionFecha,
      sesionHora,
      sesionId
    });
    
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
    
    console.log('   Datos preparados para email:', {
      email: datosEmail.email,
      nombre: datosEmail.nombre,
      precioTotal: datosEmail.precioTotal
    });
    
    // Enviar el email
    await enviarEmailConfirmacion(datosEmail);
    
    console.log('✅ [WEBHOOK] Email de confirmación enviado exitosamente a:', session.customer_email);
    
    // Las entradas YA FUERON descontadas al crear la sesión de checkout
    // Aquí solo confirmamos la venta y eliminamos la reserva temporal
    const reservation = pendingReservations.get(session.id);
    if (reservation) {
      console.log(`✅ [WEBHOOK] Confirmando venta de ${reservation.numEntradas} entradas para sesión ${reservation.sesionId}`);
      pendingReservations.delete(session.id);
      console.log(`📝 Reserva temporal eliminada: ${session.id}`);
    } else {
      // Esto es normal si el webhook llega después de que el usuario consultó el estado
      // o si hubo múltiples eventos de webhook (Stripe puede enviar duplicados)
      console.log(`ℹ️ [WEBHOOK] Reserva temporal ya fue procesada para session ${session.id} (esto es normal)`);
    }
    
  } catch (error) {
    console.error('❌ [WEBHOOK] ERROR CRÍTICO enviando email de confirmación:');
    console.error('   Mensaje:', error.message);
    console.error('   Nombre del error:', error.name);
    console.error('   Stack completo:', error.stack);
    
    // Intentar loguear más detalles si es un error de nodemailer
    if (error.code) {
      console.error('   Código de error:', error.code);
    }
    if (error.response) {
      console.error('   Respuesta del servidor:', error.response);
    }
    if (error.responseCode) {
      console.error('   Código de respuesta:', error.responseCode);
    }
    
    // Re-lanzar el error para que se capture en el nivel superior
    throw error;
  }
}

/**
 * POST /api/stripe/webhook
 * Endpoint para recibir eventos de Stripe (webhooks)
 * Maneja: checkout.session.completed, checkout.session.expired, checkout.session.async_payment_failed
 * 
 * IMPORTANTE: Este endpoint debe usar express.raw() en lugar de express.json()
 * para verificar la firma del webhook
 */
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Verificar que la solicitud viene de Stripe
    if (webhookSecret && process.env.NODE_ENV === 'production') {
      // Solo verificar en producción
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      console.log('🔐 Webhook verificado con firma de Stripe');
    } else {
      // En desarrollo, sin verificación de firma
      if (!webhookSecret) {
        console.warn('⚠️ ADVERTENCIA: STRIPE_WEBHOOK_SECRET no configurado');
        console.warn('   Para testing local, usa Stripe CLI: stripe listen --forward-to http://localhost:3000/api/stripe/webhook');
        console.warn('   O los webhooks no funcionarán correctamente.');
      }
      event = JSON.parse(req.body.toString());
    }

    const timestamp = new Date().toISOString();
    console.log(`\n🔔 [WEBHOOK ${timestamp}] Evento recibido: ${event.type}`);
    console.log(`   Event ID: ${event.id}`);
    console.log(`   Livemode: ${event.livemode ? 'PRODUCCIÓN' : 'TEST'}`);

    // Manejar diferentes tipos de eventos
    switch (event.type) {
      case 'checkout.session.completed':
        // Pago completado exitosamente
        const session = event.data.object;
        console.log(`✅ [WEBHOOK] Pago completado exitosamente`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Email: ${session.customer_email}`);
        console.log(`   Monto: ${session.amount_total / 100} ${session.currency.toUpperCase()}`);
        console.log(`   Payment Status: ${session.payment_status}`);
        
        // IMPORTANTE: Procesar en background para responder rápido a Stripe
        // Stripe espera una respuesta en menos de 5 segundos
        setImmediate(async () => {
          try {
            await enviarEmailConfirmacionAutomatico(session);
            console.log(`✅ [WEBHOOK] Procesamiento completado para sesión ${session.id}`);
          } catch (error) {
            console.error(`❌ [WEBHOOK] ERROR CRÍTICO procesando pago completado`);
            console.error(`   Session ID: ${session.id}`);
            console.error(`   Error: ${error.message}`);
            // IMPORTANTE: En producción, aquí deberías registrar esto en un sistema de monitoreo
            // como Sentry, CloudWatch, Application Insights, etc.
          }
        });
        break;

      case 'checkout.session.expired':
        // Sesión expirada (usuario no completó el pago en 30 minutos)
        const expiredSession = event.data.object;
        console.log(`⏰ [WEBHOOK] Sesión expirada sin completar el pago`);
        console.log(`   Session ID: ${expiredSession.id}`);
        console.log(`   Email: ${expiredSession.customer_email || 'N/A'}`);
        console.log(`   Expiró en: ${new Date(expiredSession.expires_at * 1000).toLocaleString('es-ES')}`);
        
        // CRÍTICO: Devolver las entradas reservadas
        const expiredReservation = pendingReservations.get(expiredSession.id);
        if (expiredReservation) {
          const sesionData = sesiones.find(s => s.id === expiredReservation.sesionId);
          if (sesionData) {
            sesionData.entradasDisponibles += expiredReservation.numEntradas;
            console.log(`🔓 [WEBHOOK] Entradas devueltas por expiración: ${expiredReservation.numEntradas}`);
            console.log(`   Nueva disponibilidad para sesión ${expiredReservation.sesionId}: ${sesionData.entradasDisponibles}`);
          }
          pendingReservations.delete(expiredSession.id);
        }
        break;

      case 'checkout.session.async_payment_failed':
        // Pago falló (por ejemplo, tarjeta rechazada)
        const failedSession = event.data.object;
        console.log(`❌ [WEBHOOK] Pago fallido`);
        console.log(`   Session ID: ${failedSession.id}`);
        console.log(`   Email: ${failedSession.customer_email}`);
        console.log(`   Razón: ${failedSession.last_payment_error?.message || 'No especificada'}`);
        
        // CRÍTICO: Devolver las entradas reservadas
        const failedReservation = pendingReservations.get(failedSession.id);
        if (failedReservation) {
          const sesionData = sesiones.find(s => s.id === failedReservation.sesionId);
          if (sesionData) {
            sesionData.entradasDisponibles += failedReservation.numEntradas;
            console.log(`🔓 [WEBHOOK] Entradas devueltas por pago fallido: ${failedReservation.numEntradas}`);
            console.log(`   Nueva disponibilidad para sesión ${failedReservation.sesionId}: ${sesionData.entradasDisponibles}`);
          }
          pendingReservations.delete(failedSession.id);
        }
        break;

      case 'payment_intent.payment_failed':
        // Intento de pago falló
        const paymentIntent = event.data.object;
        console.log(`❌ [WEBHOOK] Intento de pago falló`);
        console.log(`   Payment Intent ID: ${paymentIntent.id}`);
        console.log(`   Error: ${paymentIntent.last_payment_error?.message || 'Desconocido'}`);
        break;

      default:
        console.log(`ℹ️ [WEBHOOK] Evento no manejado: ${event.type}`);
    }

    // Responder a Stripe que recibimos el evento (CRÍTICO: responder rápido)
    res.json({ received: true });

  } catch (err) {
    console.error('\n❌ [WEBHOOK] ERROR CRÍTICO procesando webhook de Stripe');
    console.error(`   Timestamp: ${new Date().toISOString()}`);
    console.error(`   Error: ${err.message}`);
    console.error(`   Stack: ${err.stack}`);
    
    if (err.type === 'StripeSignatureVerificationError') {
      console.error('🚨 FIRMA DE WEBHOOK INVÁLIDA - Posible ataque o configuración incorrecta');
    }
    
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
