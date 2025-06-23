import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

export async function createCheckoutSession(seatIds) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'eur',
        product: 'prod_SYHpvvgTh3Aght', // Cambia por tu ID real de producto
        unit_amount: 1000,
      },
      quantity: seatIds.length,
    }],
    mode: 'payment',
    success_url: 'http://localhost:4200/confirmation?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: 'http://localhost:4200/seating',
    payment_intent_data: {
        metadata: {
            seatIds: seatIds.join(','),
        }
    }
  });
  return session;
}

export async function getSessionDetails(sessionId) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['payment_intent', 'line_items'],
  });
  return session;
}