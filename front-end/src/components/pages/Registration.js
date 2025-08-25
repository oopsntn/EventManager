// src/components/page/Registration.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Button, Badge } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

function Registration() {
    const [registrations, setRegistrations] = useState([]);
    const { user } = useAuth();
    const userId = user?.id;

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:9999/api/registrations/${userId}`
                );
                setRegistrations(res.data);
            } catch (err) {
                console.error("Error fetching registrations:", err);
            }
        };
        if (userId) fetchRegistrations();
    }, [userId]);

    const handleCancel = async (eventId, eventTitle) => {
        const confirmCancel = window.confirm(
            `Bạn có chắc muốn hủy đăng ký sự kiện "${eventTitle}" không?`
        );
        if (!confirmCancel) return;

        try {
            await axios.delete("http://localhost:9999/api/registrations", {
                data: { userId, eventId },
            });
            setRegistrations((prev) =>
                prev.filter((r) => r.eventId._id !== eventId)
            );
            alert("Đã hủy đăng ký");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi hủy đăng ký");
        }
    };

    return (
        <div className="container mt-4">
            <h2>Sự kiện bạn đã đăng ký</h2>
            {registrations.map((reg) => {
                const event = reg.eventId;
                return (
                   <Card className="mb-3" key={reg._id}>
                        <Card.Body>
                            <Card.Title>{reg.eventId.title}</Card.Title>
                            <Card.Text>
                            <strong>Mô tả:</strong> {reg.eventId.description || "Không có"} <br />
                            <strong>Địa điểm:</strong> {reg.eventId.location} <br />
                            <strong>Thời gian bắt đầu:</strong>{" "}
                            {new Date(reg.eventId.startTime).toLocaleString()} <br />
                            <strong>Thời gian kết thúc:</strong>{" "}
                            {new Date(reg.eventId.endTime).toLocaleString()} <br />
                            <strong>Trạng thái:</strong>{" "}
                            <Badge bg={reg.eventId.status === "upcoming" ? "success" : "secondary"}>
                                {reg.eventId.status}
                            </Badge> <br />
                            <strong>Danh mục:</strong>{" "}
                            {reg.eventId.eventCategoryIds?.map((cat) => cat.name).join(", ") || "Không có"} <br />
                            <strong>Số người tham gia:</strong>{" "}
                            {reg.eventId.participants ?? "Chưa có dữ liệu"}
                            </Card.Text>

                            <Button
                            variant="danger"
                            onClick={() => handleCancel(reg.eventId._id, reg.eventId.title)}
                            >
                            Hủy đăng ký
                            </Button>
                        </Card.Body>
                        </Card>

                );
            })}
        </div>
    );
}

export default Registration;
