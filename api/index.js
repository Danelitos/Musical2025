// Este archivo exporta el servidor Express como una función serverless de Vercel
try {
  // Cargar variables de entorno (aunque Vercel las inyecta automáticamente)
  require('dotenv').config();
  
  console.log('🚀 Iniciando función serverless...');
  console.log('📍 NODE_ENV:', process.env.NODE_ENV);
  console.log('� VERCEL:', process.env.VERCEL);
  console.log('�🔑 STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Configurada' : '❌ NO configurada');
  console.log('💾 MONGODB_URI:', process.env.MONGODB_URI ? '✅ Configurada' : '❌ NO configurada');
  
  const app = require('../backend/server');
  
  // Exportar la app de Express directamente
  // Vercel llamará a esta función en cada request
  module.exports = app;
} catch (error) {
  console.error('❌ ERROR CRÍTICO al cargar la función serverless:', error.message);
  console.error('Stack:', error.stack);
  
  // Exportar una función de error para que Vercel al menos responda
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Error al iniciar el servidor',
      message: error.message,
      details: process.env.NODE_ENV === 'production' ? 'Ver logs de Vercel' : error.stack,
      timestamp: new Date().toISOString()
    });
  };
}
