import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { scroller } from "react-scroll";
import './Confrim.css';

const Confirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const reservationData = location.state;
  const [loading, setLoading] = useState(false);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    if (reservationData) {
      setFormattedDate(formatDateToMMDDYYYY(reservationData.date));
    }
  }, [reservationData]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:4000/reservation/send",
        reservationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      navigate("/success");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "An error occurred";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/", { state: reservationData });
    setTimeout(() => {
      scroller.scrollTo("reservation", {
        duration: 2000,
        delay: 0,
        smooth: "easeInOutQuart",
      });
    }, 100);
  };

  const formatDateToMMDDYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  if (!reservationData) {
    navigate("/");
    return null;
  }

  return (
    <section className="confirm">
      <div className="container">
        <div className="confirm_box">
          <img src="../../../public/logo_image.png" alt="" className="logo" />
          <h1>Xác Nhận Đặt Chỗ</h1>
          <div className="confirm_details">
            <div className="detail_item">
              <p className="label">Họ và tên:</p>
              <p>{reservationData.name}</p>
            </div>
            <div className="detail_item">
              <p className="label">Email:</p>
              <p>{reservationData.email}</p>
            </div>
            <div className="detail_item">
              <p className="label">Điện thoại:</p>
              <p>{reservationData.phone}</p>
            </div>
            <div className="detail_item">
              <p className="label">Ngày:</p>
              <p>{formattedDate}</p>
            </div>
            <div className="detail_item">
              <p className="label">Giờ:</p>
              <p>{reservationData.time}</p>
            </div>
            <div className="detail_item">
              <p className="label">Số lượng khách:</p>
              <p>{reservationData.guests}</p>
            </div>
            <div className="detail_item">
              <p className="label">Ghi chú:</p>
              <p>{reservationData.notes}</p>
            </div>
          </div>
          <div className="confirm_buttons">
            <button onClick={handleBack} className="back_button">
              Quay lại
            </button>
            <button onClick={handleConfirm} disabled={loading}>
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Confirm;
