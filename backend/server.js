const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const stripeRoutes = require('./routes/stripe');
const { router: emailRoutes } = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP por ventana
  message: 'Demasiadas solicitudes desde esta IP, inténtalo de nuevo más tarde.'
});
app.use('/api', limiter);

// CORS - permitir solo frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true
}));

// Middleware para JSON (excepto webhooks de Stripe)
app.use('/api', express.json({ limit: '10mb' }));

// Rutas
app.use('/api/stripe', stripeRoutes);
app.use('/api/email', emailRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend del Musical En Belén de Judá funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`🎭 Servidor del Musical "En Belén de Judá" ejecutándose en puerto ${PORT}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`🔐 Stripe configurado: ${process.env.STRIPE_SECRET_KEY ? 'Sí' : 'No'}`);
});
