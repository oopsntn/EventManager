import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Card, Row, Col, Badge, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const EventDetail = () => {
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventDetail();
    }, [id]);

    const fetchEventDetail = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:9999/api/events/eventDetail/${id}`);
            setEvent(response.data);
        } catch (error) {
            setError('Không thể tải thông tin event');
            console.error('Error fetching event detail:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN');
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'upcoming': { variant: 'primary', text: 'Sắp diễn ra' },
            'ongoing': { variant: 'success', text: 'Đang diễn ra' },
            'ended': { variant: 'secondary', text: 'Đã kết thúc' },
            'cancelled': { variant: 'danger', text: 'Đã hủy' }
        };
        
        const config = statusConfig[status] || { variant: 'info', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    if (loading) {
        return (
            <div className="text-center p-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-4">
                <Alert variant="danger" onClose={() => setError('')} dismissible>
                    {error}
                </Alert>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="container mt-4">
                <Alert variant="warning">Không tìm thấy event</Alert>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Chi tiết Event</h2>
                <div>
                    <Button 
                        variant="secondary" 
                        className="me-2"
                        onClick={() => navigate('/my-events')}
                    >
                        Quay lại
                    </Button>
                    <Button 
                        variant="primary"
                        onClick={() => navigate(`/event/${id}/registrations`)}
                    >
                        Xem danh sách đăng ký
                    </Button>
                </div>
            </div>

            <Card>
                <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                        <h3 className="mb-0">{event.title}</h3>
                        {getStatusBadge(event.status)}
                    </div>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={8}>
                            <div className="mb-3">
                                <h5>Mô tả</h5>
                                <p className="text-muted">{event.description || 'Không có mô tả'}</p>
                            </div>

                            <Row>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <h6>Thời gian bắt đầu</h6>
                                        <p className="text-muted">{formatDateTime(event.startTime)}</p>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="mb-3">
                                        <h6>Thời gian kết thúc</h6>
                                        <p className="text-muted">{formatDateTime(event.endTime)}</p>
                                    </div>
                                </Col>
                            </Row>

                            <div className="mb-3">
                                <h6>Địa điểm</h6>
                                <p className="text-muted">{event.location}</p>
                            </div>

                            <div className="mb-3">
                                <h6>Danh mục</h6>
                                <div>
                                    {event.categories && event.categories.length > 0 ? (
                                        event.categories.map((category, index) => (
                                            <Badge 
                                                key={index} 
                                                bg="info" 
                                                className="me-2"
                                            >
                                                {category.name}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-muted">Không có danh mục</span>
                                    )}
                                </div>
                            </div>
                        </Col>

                        <Col md={4}>
                            <Card className="bg-light">
                                <Card.Body>
                                    <h6>Thống kê</h6>
                                    <div className="mb-2">
                                        <strong>Số người đăng ký:</strong>
                                        <span className="ms-2 text-primary">
                                            {event.currentParticipant || 0}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Số người tối đa:</strong>
                                        <span className="ms-2 text-info">
                                            {event.maxParticipant || 'Không giới hạn'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Ngày tạo:</strong>
                                        <span className="ms-2 text-muted">
                                            {formatDateTime(event.createdAt)}
                                        </span>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        </div>
    );
};

export default EventDetail; 