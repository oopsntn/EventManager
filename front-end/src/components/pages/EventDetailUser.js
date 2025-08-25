// src/components/page/EventDetail.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import { Button, Spinner, Card, Badge } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
function EventDetailUser() {
  
  const { user } = useAuth();   // Lấy user hiện tại từ context
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

const fetchEvent = async () => {
  try {
    const res = await axios.get(`http://localhost:9999/api/home/${id}`, {
      params: { userId: user?.id }   // Sửa _id -> id
    });
    setEvent(res.data);
  } catch (err) {
    console.error("Error fetching event:", err);
  } finally {
    setLoading(false);
  }
};

const handleRegister = async () => {
  try {
    if (!user) {
      alert("Bạn cần đăng nhập để đăng ký");
      return;
    }
    await axios.post("http://localhost:9999/api/registrations", {
      userId: user.id,   // Sửa _id -> id
      eventId: event._id,
    });
    alert("Đăng ký thành công!");
    fetchEvent();
  } catch (err) {
    alert("Lỗi khi đăng ký");
    console.error(err);
  }
};
useEffect(() => {
  if (user) {
    fetchEvent();
  }
}, [id, user]);



  if (loading) return <Spinner animation="border" />;
  if (!event) return <p>Không tìm thấy sự kiện</p>;

  return (
    <div className="mt-4 container">
      <Card>
        <Card.Body>
          <Card.Title>{event.title}</Card.Title>

          <p>
            <strong>Mô tả:</strong> {event.description}
          </p>
          <p>
            <strong>Thời gian:</strong>{" "}
            {moment(event.startTime).format("DD/MM/YYYY HH:mm")} -{" "}
            {moment(event.endTime).format("DD/MM/YYYY HH:mm")}
          </p>
          <p>
            <strong>Địa điểm:</strong> {event.location}
          </p>
          <p>
            <strong>Người tham gia:</strong>{" "}
            {event.participants}/{event.maxParticipant}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <Badge bg={event.status === "upcoming" ? "success" : "secondary"}>
              {event.status}
            </Badge>
          </p>
            <p>
            <strong>Danh mục:</strong>{" "}
            {event.eventCategoryIds?.length > 0
                ? event.eventCategoryIds.map(cat => cat.name).join(", ")
                : "Không có"}
            </p>
          <Button
            variant="primary"
            onClick={handleRegister}
            disabled={event.participants >= event.maxParticipant || event.isRegistered}
            >
            {event.isRegistered
                ? "Đã đăng ký tham gia"
                : event.participants >= event.maxParticipant
                ? "Sự kiện đã đủ người"
                : "Đăng ký tham gia"}
            </Button>

        </Card.Body>
      </Card>
    </div>
  );
}

export default EventDetailUser;
