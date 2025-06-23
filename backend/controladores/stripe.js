import { createCheckoutSession as createCheckoutSessionModel, getSessionDetails } from '../modelos/stripe.js';
import { updateSeatsAsReserved } from '../modelos/theater.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function createCheckoutSession(req, res) {
  const { seatIds } = req.body;
  if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'No seatIds provided' });
  }
  try {
    const session = await createCheckoutSessionModel(seatIds);
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getStripeSession(req, res) {
  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: 'No session_id provided' });
  }
  try {
    const session = await getSessionDetails(session_id);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Webhook Stripe (POST)
export async function payConfirmation(req, res) {
  let event;
  if (webhookSecret) {
    const sig = req.headers['stripe-signature'];
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }
  } else {
    try {
      event = JSON.parse(req.body);
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }

  if (event.type === 'payment_intent.succeeded') {
    const session = event.data.object;
    const seatIds = (session.metadata && session.metadata.seatIds) ? session.metadata.seatIds.split(',') : [];
    if (seatIds.length > 0) {
      await updateSeatsAsReserved(seatIds);
    }
  }
  res.json({ received: true });
}
