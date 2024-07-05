import { TableReservation } from '../models/tableReservations.js';
import mongoose from 'mongoose';

export const addFoodToReservation = async (req, res) => {
    try {
        const { reservationId, food } = req.body;

        // Kiểm tra tính hợp lệ của reservationId
        if (!mongoose.Types.ObjectId.isValid(reservationId)) {
            return res.status(400).json({ message: 'Invalid reservationId' });
        }

        // Tìm reservation theo reservationId
        const tableReservation = await TableReservation.findById(reservationId);

        if (!tableReservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        // Kiểm tra cấu trúc của food
        const { name, quantity, price } = food;
        if (!name || !quantity || !price) {
            return res.status(400).json({ message: 'Invalid food data. Ensure name, quantity, and price are provided.' });
        }

        // Khởi tạo trường foods nếu chưa tồn tại
        tableReservation.foods = tableReservation.foods || [];

        // Thêm món ăn vào danh sách món ăn của reservation
        tableReservation.foods.push({ name, quantity, price });

        // Lưu lại reservation
        await tableReservation.save();

        res.status(200).json({ message: 'Food added to reservation successfully', tableReservation });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
};
