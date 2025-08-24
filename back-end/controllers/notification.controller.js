const Notification = require("../models/notification");
const User = require("../models/user");

const sendNotificationToUser = (req, userId, notification)=> {
    const io =  req.app.get('io');
    const userSockets = req.app.get('userSockets');

    const socketId = userSockets.get(userId.toString());
    if(socketId){
        io.to(socketId).emit('new_notification', notification);
    }
};

exports.getUserNotifications = async (req,res) => {
    try {
        const {userId} = req.params;
        const {page = 1, limit = 10, status} = req.query;

        const filter = {userId};
        if (status) filter.status = status;

        const notifications = await Notification.find(filter)
            .populate('eventId', 'title startTime location')
            .sort({createdAt: -1})
            .limit(limit *1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(filter);
        const unreadCount = await Notification.countDocuments({
            userId,
            status: 'unread'
        });

        res.json({
            notifications,
            pagination: {
                current: page,
                total: Math.ceil(total/ limit),
                count: total
            }, 
            unreadCount
        });
    } catch (error) {
        console.error('Get user notification error: ', error);
        res.status(500).json({message: "Server error", error: error.message});
    }
};

exports.createNotificationForUser = async (req, res) => {
    try {
        const {userId, content, eventId} = req.body;

        if (!userId || !content){
            return res.status(400).json({message: "userId and content are required"});
        }

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        const notification = new Notification({
            userId,
            content,
            eventId: eventId || null,
            status: 'unread'
        });

        await notification.save();

        await notification.populate('eventId', 'title startTime location');

        sendNotificationToUser(req, userId, {
            id: notification._id,
            content: notification.content,
            eventId: notification.eventId,
            status: notification.status,
            createdAt: notification.createdAt
        });

        res.status(201).json({message: "Notification created and sent successfully", 
            notification
        });
    } catch (error) {
        console.error('Create notification error: ', error);
        res.status(500).json({ message:"Server error", error: error.message});
    }
};

exports.broadcastNotification = async (req, res) => {
    try {
        const {content, eventId, userRole} = req.body;

        if(!content){
            return res.status(400).json({message: "Content is required"});
        }

        const userFilter = userRole ? { role: userRole} : {};
        const users = await User.find(userFilter, '_id');

        const notifications = users.map(user => ({
            userId: user._id,
            content,
            eventId: eventId || null,
            status: 'unread'
        }));

        const createdNotifications = await Notification.insertMany(notifications);

        const io = req.app.get('io');
        const userSockets = req.app.get('userSockets');

        users.forEach(user => {
            const socketId = userSockets.get(user._id.toString());
            if(socketId) {
                io.to(socketId).emit('new_notification', {
                    content,
                    eventId,
                    status: 'unread',
                    createdAt: new Date()
                });
            }
        });
        res.status(201).json({
            message: `Broadcast notification sent to ${users.length} users`,
            count:users.length
        });
    } catch (error) {
        console.error('Broadcast notification error: ', error);
        res.status(500).json({message: "Server error", error: error.message});
    }
};

exports.markAsRead = async (req,res) => {
    try {
        const {id} = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            {status: 'read'},
            {new: true}
        );

        if(!notification){
            return res.status(404).json({message: "Notification not found"});
        }

        res.json({
            message: "Notification marked as read",
            notification
        });
    } catch (error) {
        console.error('Mark notification as read error: ', error);
        res.status(500).json({message: "Server error", error: error.message}); 
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const {userId} = req.params;

        await Notification.updateMany(
            {userId, status: 'unread'},
            {status: 'read'}
        );

        res.json({
            message: "All notifications marked as read"
        });
    } catch (error) {
        console.error('Mark all notifications as read error: ', error);
        res.status(500).json({message: "Server error", error: error.message});
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const {id} = req.params;
        const notification = await Notification.findByIdAndDelete(id);
        if(!notification){
            return res.status(404).json({message: "Notification not found"});
        }

        res.json({message: "Notification deleted sucessfully"});
    } catch (error) {
        console.error('Delete notification error: ', error);
        res.status(500).json({message: "Server error", error: error.message});
    }
};

exports.creatEventRegistrationNotification = async (req, userId, eventId, eventTitle) => {
    try {
        const notification = new Notification({
            userId,
            eventId,
            content: `Bạn đã đăng ký thành công sự kiện "${eventTitle}"`,
            status: 'unread'
        });

        await notification.save();
        await notification.populate('eventId', 'title startTime location');

        sendNotificationToUser(req, userId, {
            id: notification._id,
            content: notification.content,
            eventId: notification.eventId,
            status: notification.status,
            createdAt: notification.createdAt
        });

        return notification;
    } catch (error) {
        console.error('Create event registration notification error: ', error);
    }
};