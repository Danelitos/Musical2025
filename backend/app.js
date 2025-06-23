import express, { json } from 'express' // require -> commonJS
import { corsMiddleware } from './middlewares/cors.js'
import 'dotenv/config'
import path from 'path';
import theaterRoutes from './routes/theater.js';
import stripeRoutes from './routes/stripe.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware());

import { payConfirmation } from './controladores/stripe.js';
app.post('/api/webhook', express.raw({ type: 'application/json' }), payConfirmation);

app.use(json());

// API routes (MVC)
app.use('/api', theaterRoutes);
app.use('/api', stripeRoutes);

// Fallback route for serving Angular app (for production)
//app.use(express.static(path.join(__dirname, '../dist/demo')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/demo/index.html'));
  console.log(`Server running on port ${PORT}`);
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});