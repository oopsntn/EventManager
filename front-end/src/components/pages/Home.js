<<<<<<< Updated upstream
import React from 'react';

function Home() {
    return (
        <div>
            Đây là home
        </div>
    );
=======
// src/components/page/Home.js
import React from "react";
import Schedule from "./Schedule";
import axios from "axios";

function Home() {
  const handleRegister = async (eventId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        alert("Bạn cần đăng nhập để đăng ký");
        return;
      }
      await axios.post("http://localhost:9999/api/registrations", {
        userId,
        eventId,
      });
      alert("Đăng ký thành công!");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi đăng ký");
    }
  };

  return (
    <div className="container mt-4">
      <h1>Chào mừng bạn đến với hệ thống sự kiện 🎉</h1>
      <Schedule onRegister={handleRegister} />
    </div>
  );
>>>>>>> Stashed changes
}

export default Home;
