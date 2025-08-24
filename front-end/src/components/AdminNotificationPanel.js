// components/AdminNotificationPanel.js
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const AdminNotificationPanel = () => {
    const [notificationData, setNotificationData] = useState({
        type: 'single',
        userId: '',
        content: '',
        eventId: '',
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
                userId: '',
                content: '',
                eventId: '',
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
                            <h3>📢 Send Notification</h3>
                        </Card.Header>
                        <Card.Body>
                            {message && (
                                <Alert variant={message.includes('Error') ? 'danger' : 'success'}>
                                    {message}
                                </Alert>
                            )}
                            
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Notification Type</Form.Label>
                                    <div>
                                        <Form.Check
                                            type="radio"
                                            label="Send to specific user"
                                            value="single"
                                            checked={notificationData.type === 'single'}
                                            onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
                                        />
                                        <Form.Check
                                            type="radio"
                                            label="Broadcast to all users"
                                            value="broadcast"
                                            checked={notificationData.type === 'broadcast'}
                                            onChange={(e) => setNotificationData({...notificationData, type: e.target.value})}
                                        />
                                    </div>
                                </Form.Group>

                                {notificationData.type === 'single' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>User ID</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter User ID"
                                            value={notificationData.userId}
                                            onChange={(e) => setNotificationData({...notificationData, userId: e.target.value})}
                                        />
                                    </Form.Group>
                                )}

                                {notificationData.type === 'broadcast' && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Target Users</Form.Label>
                                        <Form.Select
                                            value={notificationData.userRole}
                                            onChange={(e) => setNotificationData({...notificationData, userRole: e.target.value})}
                                        >
                                            <option value="">All users</option>
                                            <option value="user">Users only</option>
                                            <option value="organizer">Organizers only</option>
                                        </Form.Select>
                                    </Form.Group>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Label>Content</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        placeholder="Enter notification content"
                                        value={notificationData.content}
                                        onChange={(e) => setNotificationData({...notificationData, content: e.target.value})}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Event ID (Optional)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter Event ID (optional)"
                                        value={notificationData.eventId}
                                        onChange={(e) => setNotificationData({...notificationData, eventId: e.target.value})}
                                    />
                                </Form.Group>

                                <Button 
                                    variant="primary" 
                                    onClick={sentNotification}
                                    disabled={loading || !notificationData.content}
                                >
                                    {loading ? 'Sending...' : 'Send Notification'}
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
