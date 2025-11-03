const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const stripeRoutes = require('./routes/stripe');
const { router: emailRoutes } = require('./routes/email');
const validacionRoutes = require('./routes/validacion');
const { inicializarIndices } = require('./services/database.service');
const { conectarMongoDB } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE DE SEGURIDAD
// ========================================

// Helmet: Protección de headers HTTP
app.use(helmet());

// Rate Limiting: Prevenir abuso de API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.'
});
app.use('/api', limiter);

// CORS: Permitir solo frontend autorizado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// ========================================
// MIDDLEWARE PARA PARSEAR JSON
// ========================================

// Webhook de Stripe debe usar raw body para verificar firma
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parser para el resto de rutas
app.use('/api', express.json({ limit: '10mb' }));

// ========================================
// RUTAS DE LA API
// ========================================

app.use('/api/stripe', stripeRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/validacion', validacionRoutes);

/**
 * GET /api/health
 * Health check endpoint para verificar estado del servidor
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend del Musical En Belén de Judá funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// MANEJO DE ERRORES
// ========================================

/**
 * Middleware global de manejo de errores
 */
app.use((err, req, res, next) => {
  console.error('❌ Error del servidor:', err.message);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

/**
 * Ruta 404 - No encontrada
 */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ========================================
// INICIAR SERVIDOR
// ========================================

/**
 * Inicializa MongoDB y el servidor
 */
async function iniciarServidor() {
  try {
    // Conectar a MongoDB solo si MONGODB_URI está configurado
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ MONGODB_URI no configurado - Base de datos deshabilitada');
      console.log('   Las transacciones NO se guardarán');
      return;
    }
    
    // Conectar a MongoDB
    console.log('🔌 Iniciando conexión a MongoDB...');
    await conectarMongoDB();
    
    // Inicializar índices (solo se ejecuta si no existen)
    await inicializarIndices();
    
    console.log('✅ Base de datos lista');
    
  } catch (error) {
    console.error('❌ ERROR conectando a MongoDB:', error.message);
    console.error('⚠️ El servidor continuará funcionando sin MongoDB');
    console.error('   Las transacciones NO se guardarán en la base de datos');
  }
}

// Inicializar MongoDB de forma asíncrona (no bloqueante)
// En serverless, esto se ejecutará en cada petición
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  // En Vercel, inicializar de forma lazy (cuando llegue la primera petición)
  let mongoInitialized = false;
  app.use(async (req, res, next) => {
    if (!mongoInitialized) {
      mongoInitialized = true;
      iniciarServidor().catch(err => console.error('Error inicializando MongoDB:', err));
    }
    next();
  });
} else {
  // En desarrollo local, inicializar inmediatamente
  iniciarServidor();
}

// Solo iniciar el servidor si no estamos en Vercel (serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🎭 ======================================`);
    console.log(`   Musical "En Belén de Judá" - Backend`);
    console.log(`   ======================================`);
    console.log(`   🌍 Servidor ejecutándose en puerto ${PORT}`);
    console.log(`   🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`   🔐 Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   📧 Email: ${process.env.EMAIL_USER ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   💾 MongoDB: ${process.env.MONGODB_URI ? '✅ Configurado' : '⚠️ No configurado (opcional)'}`);
    console.log(`   🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   ======================================\n`);
  });
}

// Exportar la app para Vercel
module.exports = app;
