// hooks/useSocket.js
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

export const useSocket = (userId) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) return;

        const newSocket = io('http://localhost:9999');
        
        newSocket.on('connect', () => {
            console.log('Connected to server');
            // Đăng nhập user
            newSocket.emit('user_login', userId);
        });

        newSocket.on('new_notification', (notification) => {
            console.log('New notification received:', notification);
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Hiển thị browser notification nếu được phép
            if (Notification.permission === 'granted') {
                new Notification('New Event Notification', {
                    body: notification.content,
                    icon: '/favicon.ico'
                });
            }
        });

        newSocket.on('notification_marked_read', (notificationId) => {
            setNotifications(prev => 
                prev.map(notif => 
                    notif.id === notificationId 
                        ? { ...notif, status: 'read' }
                        : notif
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        });

        setSocket(newSocket);

        // Yêu cầu quyền notification
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }

        return () => {
            newSocket.close();
        };
    }, [userId]);

    // Fetch notifications từ API khi component mount
    useEffect(() => {
        if (!userId) return;

        const fetchNotifications = async () => {
            try {
                const response = await fetch(`http://localhost:9999/api/notifications/user/${userId}`);
                const data = await response.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        fetchNotifications();
    }, [userId]);

    const markAsRead = async (notificationId) => {
        try {
            await fetch(`http://localhost:9999/api/notifications/read/${notificationId}`, {
                method: 'PUT'
            });
            
            if (socket) {
                socket.emit('mark_notification_read', notificationId);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch(`http://localhost:9999/api/notifications/read-all/${userId}`, {
                method: 'PUT'
            });
            
            setNotifications(prev => 
                prev.map(notif => ({ ...notif, status: 'read' }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    return { socket, notifications, unreadCount, markAsRead, markAllAsRead };
};
