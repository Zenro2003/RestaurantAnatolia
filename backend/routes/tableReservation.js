import express from 'express';
import { addFoodToReservation } from '../controllers/tableReservation.js';

const router = express.Router();

router.post('/add-food', addFoodToReservation);

export default router;