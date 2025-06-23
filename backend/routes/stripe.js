import { Router } from 'express';
import { createCheckoutSession, getStripeSession } from '../controladores/stripe.js';

const router = Router();

router.post('/create-checkout-session', createCheckoutSession);
router.get('/stripe-session', getStripeSession);

export default router;
