// components/NotificationBell.js
import React, { useState } from 'react';
import { Dropdown, Badge, ListGroup } from 'react-bootstrap';
import { useSocket } from './hooks/useSocket';
import './NotificationBell.css'; // Tạo file CSS riêng

const NotificationBell = ({ userId }) => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket(userId);
    const [show, setShow] = useState(false);

    const handleNotificationClick = (notificationId, status) => {
        if (status === 'unread') {
            markAsRead(notificationId);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Vừa xong';
        if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <Dropdown show={show} onToggle={setShow} align="end">
            <Dropdown.Toggle
                variant="link"
                id="notification-dropdown"
                className="notification-bell-toggle position-relative p-2"
                style={{ border: 'none', background: 'none' }}
            >
                🔔
                {unreadCount > 0 && (
                    <Badge 
                        bg="danger" 
                        pill 
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.7rem' }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </Badge>
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="notification-dropdown-menu" style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
                    <h6 className="mb-0">Thông báo</h6>
                    {unreadCount > 0 && (
                        <button 
                            className="btn btn-sm btn-link p-0"
                            onClick={markAllAsRead}
                        >
                            Đánh dấu tất cả đã đọc
                        </button>
                    )}
                </div>
                
                {notifications.length === 0 ? (
                    <div className="text-center py-4 text-muted">
                        <p className="mb-0">Không có thông báo nào</p>
                    </div>
                ) : (
                    <ListGroup variant="flush">
                        {notifications.slice(0, 10).map(notif => (
                            <ListGroup.Item
                                key={notif.id}
                                className={`notification-item ${notif.status === 'unread' ? 'unread' : ''}`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleNotificationClick(notif.id, notif.status)}
                            >
                                <div className="d-flex">
                                    <div className="flex-grow-1">
                                        <p className="mb-1 small">{notif.content}</p>
                                        <small className="text-muted">
                                            {formatTime(notif.createdAt)}
                                        </small>
                                    </div>
                                    {notif.status === 'unread' && (
                                        <div className="ms-2">
                                            <span className="badge bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></span>
                                        </div>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
                
                {notifications.length > 10 && (
                    <div className="text-center py-2 border-top">
                        <small className="text-muted">
                            Hiển thị 10/{notifications.length} thông báo
                        </small>
                    </div>
                )}
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default NotificationBell;
