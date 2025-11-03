// Este archivo exporta el servidor Express como una función serverless de Vercel
try {
  const app = require('../backend/server');
  module.exports = app;
} catch (error) {
  console.error('ERROR al cargar el servidor:', error.message);
  module.exports = (req, res) => {
    res.status(500).json({
      error: 'Error al iniciar el servidor',
      message: error.message
    });
  };
}