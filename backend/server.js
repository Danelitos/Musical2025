const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const stripeRoutes = require('./routes/stripe');
const { router: emailRoutes } = require('./routes/email');

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

// JSON parser (excepto webhooks de Stripe que usan raw)
app.use('/api', express.json({ limit: '10mb' }));

// ========================================
// RUTAS DE LA API
// ========================================

app.use('/api/stripe', stripeRoutes);
app.use('/api/email', emailRoutes);

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
    console.log(`   🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   ======================================\n`);
  });
}

// Exportar la app para Vercel
module.exports = app;
