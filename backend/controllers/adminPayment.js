import Stripe from 'stripe';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { TableReservation } from '../models/tableReservation.js';
import { Reservation } from '../models/reservation.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontend_url = "http://localhost:4000";
const success_url = `${frontend_url}/admin/payment-success`;
const cancel_url = `${frontend_url}/admin/payment-cancel`;

const createAdminCheckoutSession = async (req, res) => {
    console.log("Received request to create checkout session");
    const { reservationId } = req.body;

    // Kiểm tra tính hợp lệ của reservationId
    if (!mongoose.Types.ObjectId.isValid(reservationId)) {
        return res.status(400).json({ success: false, message: 'Invalid reservation ID' });
    }

    try {
        const tableReservation = await TableReservation.findOne({ reservationId }); 

        if (!tableReservation) {
            return res.status(404).json({ success: false, message: 'Reservation not found' });
        }

        const line_items = tableReservation.dishes.map(dish => ({
            price_data: {
                currency: 'vnd',
                product_data: {
                    name: dish.dishName,
                },
                unit_amount: Math.round(dish.price),
            },
            quantity: dish.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${success_url}?reservationId=${tableReservation._id}`,
            cancel_url: `${cancel_url}?reservationId=${tableReservation._id}`,
            metadata: {
                reservationId: tableReservation._id.toString(),
                tableId: tableReservation.tableId,
                reservationDate: tableReservation.reservationDate.toISOString(),
                reservationTime: tableReservation.reservationTime,
                statusReservation: tableReservation.statusReservation,
                deposit: tableReservation.deposit ? 'true' : 'false',
                depositAmount: tableReservation.depositAmount.toString(),
                totalAmount: tableReservation.totalAmount.toString(),
                paid: tableReservation.paid.toString(),
            },
        });

        console.log('Stripe session created:', session.url);
        res.json({ success: true, session_url: session.url });
    } catch (error) {
        console.error('Error during admin checkout session creation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.log(`⚠️  Webhook signature verification failed:`, err.message);
        return res.sendStatus(400);
    }

    console.log("Received event:", JSON.stringify(event, null, 2));

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handlePaymentSuccess(session);
            break;

        case 'checkout.session.async_payment_failed':
        case 'payment_intent.payment_failed':
            const failedSession = event.data.object;
            await handlePaymentFailure(failedSession);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

const handlePaymentSuccess = async (session) => {
    const reservationId = session.metadata.reservationId;

    try {
        const reservation = await TableReservation.findOne({reservationId});
        if (reservation) {
            reservation.status = "Đã thanh toán";
            await reservation.save();
            console.log("Reservation updated successfully after payment.");

            const tableReservation = await Reservation.findOne({ reservationId });
            if (tableReservation) {
                tableReservation.statusReservation = "Đã thanh toán";
                await tableReservation.save();
            }
        } else {
            console.error("Reservation not found:", reservationId);
        }
    } catch (error) {
        console.error("Error updating reservation after payment:", error);
    }
};

const handlePaymentFailure = async (session) => {
    const reservationId = session.metadata.reservationId;

    try {
        const tableReservation = await TableReservation.findOne({ reservationId });

        if (tableReservation) {
            tableReservation.statusReservation = 'Thanh toán thất bại';
            await tableReservation.save();
            console.log("Reservation updated with payment failed status.");
        } else {
            console.error("Reservation not found:", reservationId);
        }
    } catch (error) {
        console.error("Error updating reservation after payment failure:", error.message);
    }
};

export { createAdminCheckoutSession, handleStripeWebhook };
