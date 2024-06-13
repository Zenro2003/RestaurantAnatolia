import mongoose from "mongoose";
import validator from "validator";

const reservationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Họ và tên là bắt buộc."],
    minLength: [3, "Họ và tên phải ít nhất 3 ký tự."],
    maxLength: [30, "Họ và tên không được vượt quá 30 ký tự."],
  },
  date: {
    type: Date,
    required: [true, "Ngày đặt chỗ là bắt buộc."],
    validate: {
      validator: function(value) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const selectedDate = new Date(value);
        selectedDate.setHours(0, 0, 0, 0);
        return selectedDate >= currentDate;
      },
      message: "Ngày đặt chỗ phải từ ngày hiện tại trở đi."
    }
  },
  time: {
    type: String,
    required: [true, "Thời gian đặt chỗ là bắt buộc."],
    validate: {
      validator: function(value) {
        const [hours, minutes] = value.split(':').map(Number);
        const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false });
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
        const currentTotalMinutes = currentHours * 60 + currentMinutes;
        const selectedTotalMinutes = hours * 60 + minutes;
        return selectedTotalMinutes >= currentTotalMinutes;
      },
      message: "Không thể chọn thời gian trong quá khứ."
    }
  },
  email: {
    type: String,
    required: [true, "Email là bắt buộc."],
    validate: [validator.isEmail, "Vui lòng cung cấp một địa chỉ email hợp lệ."],
  },
  phone: {
    type: String,
    required: [true, "Số điện thoại là bắt buộc."],
    validate: {
      validator: function(value) {
        return /^0\d{8,9}$/.test(value);
      },
      message: "Số điện thoại phải bắt đầu bằng '0' và có đúng 11 chữ số."
    }
  },
  guests: {
    type: Number,
    required: [true, "Số lượng khách là bắt buộc."],
    min: [1, "Phải có ít nhất 1 khách."],
  },
  notes: {
    type: String,
    maxLength: [500, "Ghi chú không được vượt quá 500 ký tự."],
  },
});

export const Reservation = mongoose.model("Reservation", reservationSchema);
