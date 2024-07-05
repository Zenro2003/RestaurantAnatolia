import Stripe from 'stripe';
import dotenv from 'dotenv';
import { Reservation } from '../models/reservation.js';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const frontend_url = "http://localhost:5173";
const success_url = `${frontend_url}/success`;
const cancel_url = `${frontend_url}/payment-cancel`;

const createCheckoutSession = async (req, res) => {
  const { name, email, phone, date, time, guests, notes, deposit } = req.body;
  console.log("Received data:", { name, email, phone, date, time, guests, notes, deposit });

  try {
    if (deposit) {
      // Tạo một đặt chỗ mới với trạng thái "đang chờ thanh toán"
      const newReservation = new Reservation({
        name,
        email,
        phone,
        date,
        time,
        guests,
        notes,
        table: "SomeTableIdentifier",
        status: "đang chờ thanh toán",
        deposit: true,
        depositAmount: 200000,
      });

      // Lưu đặt chỗ vào cơ sở dữ liệu
      const savedReservation = await newReservation.save();
      const reservationId = savedReservation._id.toString();

      const line_items = [{
        price_data: {
          currency: 'vnd',
          product_data: {
            name: 'Đặt cọc'
          },
          unit_amount: 200000,
        },
        quantity: 1,
      }];

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${success_url}?reservationId=${reservationId}`,
        cancel_url: `${cancel_url}?reservationId=${reservationId}`,
        metadata: {
          reservationId,
          name,
          email,
          phone,
          date,
          time,
          guests,
          notes,
          deposit: "true"
        },
      });

      console.log("Stripe session created:", session.url);
      res.json({ success: true, session_url: session.url });
    } else {
      const newReservation = new Reservation({
        name,
        email,
        phone,
        date,
        time,
        guests,
        notes,
        table: "SomeTableIdentifier",
        status: "Đang hoạt động",
        deposit: false,
        depositAmount: 0,
      });
      await newReservation.save();
      console.log("Reservation saved successfully.");

      res.json({ success: true, message: 'Reservation created successfully' });
    }
  } catch (error) {
    console.error("Error during checkout session creation:", error);
    res.status(500).json({ success: false, message: 'Error creating reservation or session' });
  }
};

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log("Sự kiện được xác minh:", event);
  } catch (err) {
    console.error(`⚠️  Xác minh chữ ký webhook thất bại:`, err.message);
    return res.sendStatus(400);
  }

  console.log("Sự kiện nhận được:", JSON.stringify(event, null, 2));

  switch (event.type) {
    case 'checkout.session.completed':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
    case 'charge.failed':
      await handlePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Loại sự kiện không xử lý ${event.type}`);
  }

  res.status(200).end();
};

const handlePaymentSuccess = async (session) => {
  const reservationId = session.metadata.reservationId;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (reservation) {
      reservation.status = "thanh toán thành công";
      await reservation.save();
      console.log("Reservation updated successfully after payment.");
    } else {
      console.error("Reservation not found:", reservationId);
    }
  } catch (error) {
    console.error("Error updating reservation after payment:", error);
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  const reservationId = paymentIntent.metadata.reservationId;

  try {
    const reservation = await Reservation.findById(reservationId);
    if (reservation) {
      reservation.status = "thanh toán thất bại";
      await reservation.save();
      console.log("Reservation updated with payment failed status.");
    } else {
      console.error("Reservation not found:", reservationId);
    }
  } catch (error) {
    console.error("Error updating reservation after payment failure:", error.message);
  }
};

export { createCheckoutSession, handleStripeWebhook };
