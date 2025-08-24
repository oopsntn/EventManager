import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Table, Modal, Form, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const EventList = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipant: '',
        status: 'upcoming',
        eventCategoryIds: []
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const navigate = useNavigate();
    const { user } = useAuth();
    const userId = user?.id;

    useEffect(() => {
        if (userId) {
            fetchMyEvents();
            fetchCategories();
        }
    }, [userId]);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://localhost:9999/api/events/myEvents/${userId}`);
            setEvents(response.data);
        } catch (error) {
            setError('Không thể tải danh sách events');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:9999/api/events/eventCategories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategoryChange = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            eventCategoryIds: prev.eventCategoryIds.includes(categoryId)
                ? prev.eventCategoryIds.filter(id => id !== categoryId)
                : [...prev.eventCategoryIds, categoryId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (new Date(formData.endTime) <= new Date(formData.startTime)) {
            setError('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
        }

        try {
            if (editingEvent) {
                await axios.put(`http://localhost:9999/api/events/updateEvent/${editingEvent.id}`, formData);
            } else {
                await axios.post('http://localhost:9999/api/events/createEvent', {
                    ...formData,
                    organizerId: userId
                });
            }
            setShowModal(false);
            setEditingEvent(null);
            setFormData({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                location: '',
                maxParticipant: '',
                status: 'upcoming',
                eventCategoryIds: []
            });
            fetchMyEvents();
        } catch (error) {
            setError('Không thể lưu event');
            console.error('Error saving event:', error);
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            title: event.title,
            description: event.description,
            startTime: event.startTime.split('T')[0] + 'T' + event.startTime.split('T')[1].substring(0, 5),
            endTime: event.endTime.split('T')[0] + 'T' + event.endTime.split('T')[1].substring(0, 5),
            location: event.location,
            maxParticipant: event.maxParticipant,
            status: event.status,
            eventCategoryIds: event.categories ? event.categories.map(cat => cat.id) : []
        });
        setShowModal(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:9999/api/events/deleteEvent/${eventToDelete.id}`);
            setShowDeleteModal(false);
            setEventToDelete(null);
            fetchMyEvents();
        } catch (error) {
            setError('Không thể xóa event');
            console.error('Error deleting event:', error);
        }
    };

    const openDeleteModal = (event) => {
        setEventToDelete(event);
        setShowDeleteModal(true);
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

    if (!userId) {
        return <div className="text-center p-4">Vui lòng đăng nhập để xem events</div>;
    }

    if (loading) return <div className="text-center p-4">Đang tải...</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Danh sách Events của tôi</h2>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Tạo Event mới
                </Button>
            </div>

            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {events.map((event) => (
                        <tr key={event.id}>
                            <td>{event.title}</td>
                            <td>{formatDateTime(event.startTime)}</td>
                            <td>{formatDateTime(event.endTime)}</td>
                            <td>{event.location}</td>
                            <td>{getStatusBadge(event.status)}</td>
                            <td>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => navigate(`/event/${event.id}`)}
                                >
                                    Detail
                                </Button>
                                <Button 
                                    variant="warning" 
                                    size="sm" 
                                    className="me-2"
                                    onClick={() => handleEdit(event)}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => openDeleteModal(event)}
                                >
                                    Delete
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {events.length === 0 && (
                <div className="text-center p-4">
                    <p className="text-muted">Bạn chưa có events nào. Hãy tạo event đầu tiên!</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal show={showModal} onHide={() => {
                setShowModal(false);
                setEditingEvent(null);
                setFormData({
                    title: '',
                    description: '',
                    startTime: '',
                    endTime: '',
                    location: '',
                    maxParticipant: '',
                    status: 'upcoming',
                    eventCategoryIds: []
                });
            }} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingEvent ? 'Chỉnh sửa Event' : 'Tạo Event mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Status</Form.Label>
                                    <Form.Select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="upcoming">Sắp diễn ra</option>
                                        <option value="ongoing">Đang diễn ra</option>
                                        <option value="ended">Đã kết thúc</option>
                                        <option value="cancelled">Đã hủy</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Start Time *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="startTime"
                                        value={formData.startTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>End Time *</Form.Label>
                                    <Form.Control
                                        type="datetime-local"
                                        name="endTime"
                                        value={formData.endTime}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Max Participants</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="maxParticipant"
                                        value={formData.maxParticipant}
                                        onChange={handleInputChange}
                                        min="1"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Categories</Form.Label>
                            <div className="d-flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <Form.Check
                                        key={category.id}
                                        type="checkbox"
                                        id={`category-${category.id}`}
                                        label={category.name}
                                        checked={formData.eventCategoryIds.includes(category.id)}
                                        onChange={() => handleCategoryChange(category.id)}
                                        inline
                                    />
                                ))}
                            </div>
                            {categories.length === 0 && (
                                <p className="text-muted">Không có danh mục nào</p>
                            )}
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" type="submit">
                                {editingEvent ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận xóa</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Bạn có chắc chắn muốn xóa event "{eventToDelete?.title}"?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EventList; 