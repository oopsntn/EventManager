// src/components/page/Schedule.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Spinner, Form, Badge } from "react-bootstrap";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth(); // lấy thông tin user
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:9999/api/home");
        setEvents(res.data);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Lọc theo khoảng ngày + tiêu đề
  const filteredEvents = events.filter((event) => {
    const eventStart = moment(event.startTime);
    const eventEnd = moment(event.endTime);

    // --- lọc theo khoảng ngày ---
    let matchDate = true;
    if (startDate && !endDate) {
      matchDate = eventEnd.isSameOrAfter(moment(startDate), "day");
    } else if (!startDate && endDate) {
      matchDate = eventStart.isSameOrBefore(moment(endDate), "day");
    } else if (startDate && endDate) {
      matchDate =
        eventStart.isSameOrBefore(moment(endDate), "day") &&
        eventEnd.isSameOrAfter(moment(startDate), "day");
    }

    // --- lọc theo title ---
    let matchTitle = event.title
      .toLowerCase()
      .includes(searchTitle.toLowerCase());

    return matchDate && matchTitle;
  });

 
   // hàm handle click event
  const handleEventClick = (eventId) => {
    if (!user) {
      alert("Bạn cần đăng nhập để xem chi tiết sự kiện!");
      navigate("/login"); // điều hướng sang login
      return;
    }
    navigate(`/events/${eventId}`); // nếu đã login, đi trang chi tiết
  };

  return (
    <div className="mt-4">
      <h2 className="mb-3">📅 Lịch trình sự kiện</h2>

      {/* Bộ lọc */}
      <div className="d-flex gap-3 mb-4 flex-wrap">
        <Form.Group>
          <Form.Label>Bắt đầu từ:</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Kết thúc đến:</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Tìm theo tiêu đề:</Form.Label>
          <Form.Control
            type="text"
            placeholder="Nhập tiêu đề sự kiện..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
          />
        </Form.Group>
      </div>

      {/* Danh sách sự kiện */}
      {filteredEvents.length > 0 ? (
        filteredEvents.map((event) => (
          <Card className="mb-3" key={event._id}>
            <Card.Body>
              {/* Title clickable dẫn sang trang chi tiết */}
         
              <Card.Title
                style={{ cursor: "pointer", color: "#0d6efd" }}
                onClick={() => handleEventClick(event._id)}
              >
                {event.title}
              </Card.Title>
              <Card.Text>
                <strong>Thời gian:</strong>{" "}
                {moment(event.startTime).format("DD/MM/YYYY HH:mm")} -{" "}
                {moment(event.endTime).format("DD/MM/YYYY HH:mm")}
              </Card.Text>
              <Card.Text>
                <strong>Địa điểm:</strong> {event.location}
              </Card.Text>
              <Card.Text>
                <strong>Người tham gia:</strong>{" "}
                {event.participants}/{event.maxParticipant}
              </Card.Text>
              <Card.Text>
                <strong>Trạng thái:</strong>{" "}
                <Badge bg={event.status === "upcoming" ? "success" : "secondary"}>
                  {event.status}
                </Badge>
              </Card.Text>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p>Không có sự kiện nào phù hợp.</p>
      )}
    </div>
  );
}

export default Schedule;
