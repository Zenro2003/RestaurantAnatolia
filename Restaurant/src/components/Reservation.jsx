import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineArrowRight } from "react-icons/hi";

const Reservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (location.state) {
      const { name, email, date, time, phone, guests, notes } = location.state;
      setName(name);
      setEmail(email);
      setDate(date);
      setTime(time);
      setPhone(phone);
      setGuests(guests);
      setNotes(notes);
    }
  }, [location.state]);

  const handleReservation = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const reservationData = { name, email, phone, date, time, guests, notes };
    navigate("/confirm", { state: reservationData });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = "Please input your name!";
    }
    
    if (!email) {
      newErrors.email = "Please input your email!";
    } else {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Invalid email format!";
      }
    }

    if (!date) {
      newErrors.date = "Please select a date!";
    }

    if (!time) {
      newErrors.time = "Please select a time!";
    }

    if (!phone) {
      newErrors.phone = "Please input your phone number!";
    } else if (!/^0\d{9,10}$/.test(phone)) {
      newErrors.phone = "Invalid phone number!";
    }

    if (!guests) {
      newErrors.guests = "Please input the number of guests!";
    } else if (isNaN(guests) || guests < 1) {
      newErrors.guests = "Invalid number of guests!";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const currentDate = new Date();
    const currentOnlyDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate()
    );

    if (selectedDate < currentOnlyDate) {
      // toast.error("Please select a date from today onwards.");
      setErrors((prevErrors) => ({
        ...prevErrors,
        date: "Please select a date from today onwards.",
      }));
      setDate("");
    } else {
      setErrors((prevErrors) => {
        const { date, ...rest } = prevErrors;
        return rest;
      });
      setDate(e.target.value);
    }
  };

  const handleTimeChange = (e) => {
    const selectedTime = e.target.value;
    const currentTime = new Date().toLocaleTimeString("en-US", { hour12: false });

    if (selectedTime < currentTime) {
      // toast.error("Please select a different time.");
      setErrors((prevErrors) => ({
        ...prevErrors,
        time: "Please select a different time.",
      }));
      setTime("");
    } else if (selectedTime < "08:00" || selectedTime > "23:00") {
      // toast.error("Operating hours are from 8:00 AM to 11:00 PM.");
      setErrors((prevErrors) => ({
        ...prevErrors,
        time: "Operating hours are from 8:00 AM to 11:00 PM.",
      }));
      setTime("");
    } else {
      setErrors((prevErrors) => {
        const { time, ...rest } = prevErrors;
        return rest;
      });
      setTime(selectedTime);
    }
  };

  const handleInputChange = (e, setter, field) => {
    setter(e.target.value);
    validateSingleField(field, e.target.value);
  };

  const validateSingleField = (field, value) => {
    let newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value) {
          newErrors.name = "Please input your name!";
        } else {
          delete newErrors.name;
        }
        break;
      case "email":
        if (!value) {
          newErrors.email = "Please input your email!";
        } else {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(value)) {
            newErrors.email = "Invalid email format!";
          } else {
            delete newErrors.email;
          }
        }
        break;
      case "date":
        if (!value) {
          newErrors.date = "Please select a date!";
        } else {
          delete newErrors.date;
        }
        break;
      case "time":
        if (!value) {
          newErrors.time = "Please select a time!";
        } else {
          delete newErrors.time;
        }
        break;
      case "phone":
        if (!value) {
          newErrors.phone = "Please input your phone number!";
        } else if (!/^0\d{8,9}$/.test(value)) {
          newErrors.phone = "Invalid phone number!";
        } else {
          delete newErrors.phone;
        }
        break;
      case "guests":
        if (!value) {
          newErrors.guests = "Please input the number of guests!";
        } else if (isNaN(value) || value < 1) {
          newErrors.guests = "Invalid number of guests!";
        } else {
          delete newErrors.guests;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  return (
    <section className="reservation" id="reservation">
      <div className="container">
        <div className="banner">
          <img src="/reservation.png" alt="res" />
        </div>
        <div className="banner">
          <div className="reservation_form_box">
            <h1>ĐẶT CHỖ</h1>
            <p>Có thắc mắc gì, vui lòng gọi</p>
            <form onSubmit={handleReservation}>
              <div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => handleInputChange(e, setName, "name")}
                  required
                />
                <input
                  type="number"
                  placeholder="Số lượng khách"
                  value={guests}
                  onChange={(e) => handleInputChange(e, setGuests, "guests")}
                  required
                />
              </div>
             
              <div>
                <input
                  type="date"
                  placeholder="Ngày"
                  value={date}
                  onChange={handleDateChange}
                  required
                />
               
                <input
                  type="time"
                  placeholder="Giờ"
                  value={time}
                  onChange={handleTimeChange}
                  required
                />
               
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Email"
                  className="email_tag"
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail, "email")}
                  required
                />
               
                <input
                  type="text"
                  placeholder="Điện thoại"
                  value={phone}
                  onChange={(e) => handleInputChange(e, setPhone, "phone")}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Ghi chú"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              {errors.name && <span className="error">{errors.name}</span>}
              {errors.guests && <span className="error">{errors.guests}</span>}
              {errors.time && <span className="error">{errors.time}</span>}
              {errors.date && <span className="error">{errors.date}</span>}
              {errors.email && <span className="error">{errors.email}</span>}
              {errors.phone && <span className="error">{errors.phone}</span>}
              <button type="submit">
                ĐẶT NGAY{" "}
                <span>
                  <HiOutlineArrowRight />
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
      <Toaster />
    </section>
  );
};

export default Reservation;
