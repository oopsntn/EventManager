import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Table, Modal, Form, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const EventList = () => {
    const [events, setEvents] = useState([]);
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
        maxParticipant: ''
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    const navigate = useNavigate();
    const userId = '64a1f001111111111111cccc'; // User ID mặc định

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            // Lấy danh sách events mà user là organizer
            const response = await axios.get(`http://localhost:9999/api/events/myEvents/${userId}`);
            setEvents(response.data);
        } catch (error) {
            setError('Không thể tải danh sách events');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingEvent) {
                // Update event
                await axios.put(`http://localhost:9999/api/events/updateEvent/${editingEvent.id}`, formData);
            } else {
                // Create new event
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
                maxParticipant: ''
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
            maxParticipant: event.maxParticipant
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
                    maxParticipant: ''
                });
            }}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingEvent ? 'Chỉnh sửa Event' : 'Tạo Event mới'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Max Participants</Form.Label>
                            <Form.Control
                                type="number"
                                name="maxParticipant"
                                value={formData.maxParticipant}
                                onChange={handleInputChange}
                            />
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