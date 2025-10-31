const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// ========================================
// VALIDACIÓN DE VARIABLES DE ENTORNO
// ========================================

/**
 * Valida que todas las variables de entorno críticas estén configuradas
 * Si falta alguna, detiene el servidor con un error claro
 */
function validateEnvironmentVariables() {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'SUCCESS_URL',
    'CANCEL_URL',
    'FRONTEND_URL',
    'EMAIL_USER',
    'EMAIL_PASS'
  ];

  const missingVars = [];
  const invalidVars = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      // Validaciones específicas
      if (varName === 'STRIPE_SECRET_KEY') {
        const key = process.env[varName];
        if (!key.startsWith('sk_test_') && !key.startsWith('sk_live_')) {
          invalidVars.push(`${varName} debe comenzar con 'sk_test_' o 'sk_live_'`);
        }
      }
      
      if ((varName === 'SUCCESS_URL' || varName === 'CANCEL_URL' || varName === 'FRONTEND_URL') 
          && !process.env[varName].startsWith('http')) {
        invalidVars.push(`${varName} debe ser una URL válida (http:// o https://)`);
      }

      if (varName === 'EMAIL_USER' && !process.env[varName].includes('@')) {
        invalidVars.push(`${varName} debe ser un email válido`);
      }
    }
  }

  // Validación opcional pero recomendada para producción
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.warn('⚠️ ADVERTENCIA: STRIPE_WEBHOOK_SECRET no configurado. Los webhooks no serán verificados.');
    } else if (!process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_')) {
      console.warn('⚠️ ADVERTENCIA: STRIPE_WEBHOOK_SECRET parece inválido (debe comenzar con "whsec_")');
    }

    if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_')) {
      console.warn('🚨 ADVERTENCIA CRÍTICA: Usando clave de Stripe de TEST en producción!');
    }
  }

  if (missingVars.length > 0 || invalidVars.length > 0) {
    console.error('\n❌ ERROR: Configuración de variables de entorno inválida\n');
    
    if (missingVars.length > 0) {
      console.error('Variables faltantes:');
      missingVars.forEach(v => console.error(`  - ${v}`));
    }
    
    if (invalidVars.length > 0) {
      console.error('\nVariables inválidas:');
      invalidVars.forEach(v => console.error(`  - ${v}`));
    }
    
    console.error('\n📝 Asegúrate de copiar .env.example a .env y configurar todos los valores.');
    console.error('Más información en el archivo README.md\n');
    process.exit(1);
  }

  console.log('✅ Todas las variables de entorno requeridas están configuradas');
}

// Ejecutar validación antes de iniciar el servidor
validateEnvironmentVariables();

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

// Webhook de Stripe debe usar raw body para verificar firma
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON parser para el resto de rutas
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
