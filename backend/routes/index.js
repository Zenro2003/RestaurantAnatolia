import express from "express";
import userRouter from "./user.js"
import menuRouter from "./menu.js"
import tableRouter from "./table.js"
import reservationRouter from "./reservation.js"
import paymentRouter from "./payment.js"
import tableReservation  from './tableReservation.js';


const router = express.Router()
router.use("/user", userRouter)
router.use("/menu", menuRouter)
router.use("/table", tableRouter)
router.use("/reservation",reservationRouter)
router.use("/payment",paymentRouter)
router.use("/tableReservation",tableReservation)
export default router