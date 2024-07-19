import express from 'express';
import { createAdminCheckoutSession, handleStripeWebhook } from '../controllers/adminPayment.js';

const router = express.Router();

router.post('/create-checkout-session', createAdminCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
