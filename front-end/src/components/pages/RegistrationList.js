import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, Table, Badge, Alert, Spinner, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const RegistrationList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [registrationToUpdate, setRegistrationToUpdate] = useState(null);
    const [newStatus, setNewStatus] = useState('');
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchEventAndRegistrations();
    }, [id]);

    const fetchEventAndRegistrations = async () => {
        try {
            setLoading(true);
            // Lấy thông tin event
            const eventResponse = await axios.get(`http://localhost:9999/api/events/eventDetail/${id}`);
            setEvent(eventResponse.data);

            // Lấy danh sách đăng ký
            const registrationsResponse = await axios.get(`http://localhost:9999/api/events/eventRegistrations/${id}`);
            setRegistrations(registrationsResponse.data);
        } catch (error) {
            setError('Không thể tải thông tin');
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async () => {
        try {
            await axios.put(`http://localhost:9999/api/events/updateRegistrationStatus/${registrationToUpdate.id}`, {
                status: newStatus
            });
            
            setShowConfirmModal(false);
            setRegistrationToUpdate(null);
            setNewStatus('');
            
            // Refresh data
            fetchEventAndRegistrations();
        } catch (error) {
            setError('Không thể cập nhật trạng thái');
            console.error('Error updating status:', error);
        }
    };

    const openStatusModal = (registration, status) => {
        setRegistrationToUpdate(registration);
        setNewStatus(status);
        setShowConfirmModal(true);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': { variant: 'warning', text: 'Chờ xác nhận' },
            'confirmed': { variant: 'success', text: 'Đã xác nhận' },
            'cancelled': { variant: 'danger', text: 'Đã hủy' }
        };
        
        const config = statusConfig[status] || { variant: 'info', text: status };
        return <Badge bg={config.variant}>{config.text}</Badge>;
    };

    const formatDateTime = (dateTimeString) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('vi-VN');
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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2>Danh sách đăng ký</h2>
                    {event && (
                        <p className="text-muted mb-0">Event: {event.title}</p>
                    )}
                </div>
                <Button 
                    variant="secondary"
                    onClick={() => navigate(`/event/${id}`)}
                >
                    Quay lại Event
                </Button>
            </div>

            {event && (
                <div className="mb-4">
                    <div className="row">
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Tổng đăng ký</h5>
                                    <h3 className="text-primary">{registrations.length}</h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Chờ xác nhận</h5>
                                    <h3 className="text-warning">
                                        {registrations.filter(r => r.status === 'pending').length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Đã xác nhận</h5>
                                    <h3 className="text-success">
                                        {registrations.filter(r => r.status === 'confirmed').length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="card bg-light">
                                <div className="card-body text-center">
                                    <h5 className="card-title">Đã hủy</h5>
                                    <h3 className="text-danger">
                                        {registrations.filter(r => r.status === 'cancelled').length}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Tên người dùng</th>
                        <th>Email</th>
                        <th>Số điện thoại</th>
                        <th>Ngày đăng ký</th>
                        <th>Trạng thái</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map((registration, index) => (
                        <tr key={registration.id}>
                            <td>{index + 1}</td>
                            <td>{registration.user?.name || 'N/A'}</td>
                            <td>{registration.user?.email || 'N/A'}</td>
                            <td>{registration.user?.phone || 'N/A'}</td>
                            <td>{formatDateTime(registration.registeredAt)}</td>
                            <td>{getStatusBadge(registration.status)}</td>
                            <td>
                                {registration.status === 'pending' && (
                                    <>
                                        <Button 
                                            variant="success" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => openStatusModal(registration, 'confirmed')}
                                        >
                                            Xác nhận
                                        </Button>
                                        <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => openStatusModal(registration, 'cancelled')}
                                        >
                                            Từ chối
                                        </Button>
                                    </>
                                )}
                                {registration.status === 'confirmed' && (
                                    <Button 
                                        variant="warning" 
                                        size="sm"
                                        onClick={() => openStatusModal(registration, 'cancelled')}
                                    >
                                        Hủy xác nhận
                                    </Button>
                                )}
                                {registration.status === 'cancelled' && (
                                    <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={() => openStatusModal(registration, 'confirmed')}
                                    >
                                        Xác nhận lại
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {registrations.length === 0 && (
                <div className="text-center p-4">
                    <p className="text-muted">Chưa có ai đăng ký tham gia event này</p>
                </div>
            )}

            {/* Status Update Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Xác nhận thay đổi trạng thái</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Bạn có chắc chắn muốn thay đổi trạng thái của 
                        <strong> {registrationToUpdate?.user?.name} </strong>
                        thành <strong>{newStatus === 'confirmed' ? 'Đã xác nhận' : 
                                      newStatus === 'cancelled' ? 'Đã hủy' : newStatus}</strong>?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleStatusUpdate}>
                        Xác nhận
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default RegistrationList; 