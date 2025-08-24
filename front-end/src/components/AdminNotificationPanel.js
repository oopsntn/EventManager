// components/AdminNotificationPanel.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const AdminNotificationPanel = () => {
    const [notificationData, setNotificationData] = useState({
        type: 'single',
        userEmail: '',
        content: '',
        userRole: 'user'
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const sentNotification = async () => {
        try {
            setLoading(true);
            const endpoint = notificationData.type === 'single'
                ? 'http://localhost:9999/api/notifications/create'
                : 'http://localhost:9999/api/notifications/broadcast';

            await axios.post(endpoint, notificationData);
            setMessage('Notification sent successfully!');

            // Reset form
            setNotificationData({
                type: 'single',
                userEmail: '',
                content: '',
                userRole: 'user'
            });
        } catch (error) {
            console.error('Error sending notification: ', error);
            setMessage('Error sending notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-4">
            <Row>
                <Col md={8} className="mx-auto">
                    <Card>
                        <Card.Header>
                            <h3>📢 Gửi thông báo</h3>
                        </Card.Header>
                        <Card.Body>
                            {message && (
                                <Alert variant={message.includes('Error') ? 'danger' : 'success'}>
                                    {message}
                                </Alert>
                            )}

                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Loại Thông Báo</Form.Label>
                                    <div>
                                        <Form.Check
                                            type="radio"
                                            label="Gửi cho người dùng cụ thể"
                                            value="single"
                                            checked={notificationData.type === 'single'}
                                            onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value })}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Gửi cho tất cả người dùng"
                                            value="broadcast"
                                            checked={notificationData.type === 'broadcast'}
                                            onChange={(e) => setNotificationData({ ...notificationData, type: e.target.value })}
                                        />
                                    </div>
                                </Form.Group>

                                {notificationData.type === 'single' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email Người Dùng</Form.Label>
                                        <Form.Control
                                            type="email"
                                            placeholder="Nhập email người dùng"
                                            value={notificationData.userEmail}
                                            onChange={(e) => setNotificationData({ ...notificationData, userEmail: e.target.value })}
                                        />
                                    </Form.Group>
                                )}

                                {notificationData.type === 'broadcast' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Đối Tượng Nhận</Form.Label>
                                        <Form.Select
                                            value={notificationData.userRole}
                                            onChange={(e) => setNotificationData({ ...notificationData, userRole: e.target.value })}
                                        >
                                            <option value="">Tất cả người dùng</option>
                                            <option value="user">Chỉ người dùng thường</option>
                                            <option value="organizer">Chỉ người tổ chức</option>
                                        </Form.Select>
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>💬 Nội Dung Thông Báo</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Nhập nội dung thông báo"
                                        value={notificationData.content}
                                        onChange={(e) => setNotificationData({ ...notificationData, content: e.target.value })}
                                    />
                                </Form.Group>
                                <Button
                                    variant="primary"
                                    onClick={sentNotification}
                                    disabled={loading || !notificationData.content}
                                >
                                    {loading ? ' Đang gửi...' : ' Gửi Thông Báo'}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminNotificationPanel;
