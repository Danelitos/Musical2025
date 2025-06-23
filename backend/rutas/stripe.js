const express = require('express');
const router = express.Router();
const stripeController = require('../controladores/stripe');

router.post('/create-checkout-session', stripeController.createCheckoutSession);

module.exports = router;
