import express from "express";
import route from "./routes/index.js";
import dotenv from "dotenv";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error.js";
import bodyParser from "body-parser";
import connectToDb from "./db/index.js";
import { handleStripeWebhook } from './controllers/payment.js'; // Import handleStripeWebhook

const app = express();

dotenv.config();

// Cấu hình CORS
app.use(
  cors({
    origin: ["http://127.0.0.1:5173", "http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

// Middleware để xử lý raw body cho webhook Stripe
app.post("/payment/webhook", bodyParser.raw({ type: "application/json" }), handleStripeWebhook);

// Sử dụng body-parser để xử lý JSON và x-www-form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sử dụng route từ file index.js trong thư mục routes
app.use(route);

// Middleware xử lý lỗi
app.use(errorMiddleware);

// Kết nối đến cơ sở dữ liệu
connectToDb();

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`App is listening on http://localhost:${PORT}`);
});
