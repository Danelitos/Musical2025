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
    
    console.error('\n📝 Asegúrate de configurar las variables de entorno en Vercel.');
    console.error('Más información en el archivo README.md\n');
    
    // En Vercel, lanzar error en lugar de process.exit
    if (process.env.VERCEL) {
      throw new Error('Variables de entorno no configuradas correctamente');
    }
    process.exit(1);
  }

  console.log('✅ Todas las variables de entorno requeridas están configuradas');
}

// Ejecutar validación solo en desarrollo
// En Vercel la validación se hace en cada request
if (!process.env.VERCEL) {
  validateEnvironmentVariables();
}

const stripeRoutes = require('./routes/stripe');
const { router: emailRoutes } = require('./routes/email');
const validacionRoutes = require('./routes/validacion');
const { conectarMongoDB, inicializarIndices } = require('./services/database.service');

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
let mongoInicializado = false;
let mongoInicializando = false;

async function iniciarServidor() {
  // Si ya está inicializado o inicializando, no hacer nada
  if (mongoInicializado || mongoInicializando) {
    return;
  }
  
  mongoInicializando = true;
  
  try {
    // Conectar a MongoDB
    console.log('🔌 Iniciando conexión a MongoDB...');
    await conectarMongoDB();
    
    // Inicializar índices (solo se ejecuta si no existen)
    await inicializarIndices();
    
    console.log('✅ Base de datos lista');
    mongoInicializado = true;
    
  } catch (error) {
    console.error('❌ ERROR conectando a MongoDB:', error.message);
    
    // En Vercel, fallar de forma visible
    if (process.env.VERCEL) {
      console.error('🚨 CRÍTICO: MongoDB no disponible en Vercel');
      throw error; // Esto hará que las funciones serverless fallen visiblemente
    }
    
    console.error('⚠️ El servidor continuará funcionando sin MongoDB');
    console.error('   Las transacciones NO se guardarán en la base de datos');
  } finally {
    mongoInicializando = false;
  }
}

// En desarrollo, inicializar inmediatamente
// En Vercel, inicializar de forma lazy en el primer request
if (!process.env.VERCEL) {
  iniciarServidor().catch(err => {
    console.error('💥 Error fatal iniciando servidor:', err);
  });
}

// Middleware para inicializar MongoDB en Vercel (lazy initialization)
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    if (!mongoInicializado && !mongoInicializando) {
      try {
        await iniciarServidor();
      } catch (error) {
        console.error('❌ Error inicializando MongoDB en request:', error);
        // Continuar sin MongoDB para que al menos responda
      }
    }
    next();
  });
}

// Solo iniciar el servidor si no estamos en Vercel (serverless)
if (!process.env.VERCEL) {
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
