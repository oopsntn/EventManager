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
        const {userEmail, content } = req.body;

        if (!userEmail || !content){
            return res.status(400).json({
                success: false,
                message: "Email và nội dung thông báo không được để trống"});
        }

        const user = await User.findOne({email: userEmail});
        if(!user){
            return res.status(404).json({
                message: `Không tìm thấy người dùng với email: ${userEmail}`});
        }

        const notification = new Notification({
            userId: user._id,
            content,
            eventId: null,
            status: 'unread'
        });

        await notification.save();

        // await notification.populate('eventId', 'title startTime location');

        sendNotificationToUser(req, user._id, {
            id: notification._id,
            content: notification.content,
            status: notification.status,
            createdAt: notification.createdAt
        });

        res.status(201).json({message: "Gửi thông báo thành công", 
            notification: {
                id: notification._id,
                content: notification.content,
                status: notification.status,
                createdAt: notification.createdAt,
                sentTo: {
                    email: user.email,
                    name: user.name
                }
            }
        });
    } catch (error) {
        console.error('Create notification error: ', error);
        res.status(500).json({ message:"Server error", error: error.message});
    }
};
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .populate('userId', 'name email')
            .populate('eventId', 'title startTime location')
            .sort({ createdAt: -1 })
            .limit(50);

        console.log(`📊 Total notifications in DB: ${notifications.length}`);

        res.json({
            success: true,
            count: notifications.length,
            notifications
        });
    } catch (error) {
        console.error('❌ Get all notifications error:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
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

exports.createEventRegistrationNotification = async (req, userId, eventId, eventTitle) => {
    try {
        const notification = new Notification({
            userId,
            eventId,
            content: `Cảm ơn vì đã tham gia sự kiện "${eventTitle}", Người đâu thưởng bánh Danisa`,
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

exports.createEventCancellationNotification = async (req, userId, eventId, eventTitle) => {
    try {
        const notification = new Notification({
            userId,
            eventId,
            content: `Chán tham gia sự kiện "${eventTitle}" rồi à mà đã hủy thế `,
            status: 'unread'
        });

        await notification.save();
        console.log(`💾 Cancellation notification saved to DB: ${notification._id}`);
        
        await notification.populate('eventId', 'title startTime location');

        sendNotificationToUser(req, userId, {
            id: notification._id,
            content: notification.content,
            eventId: notification.eventId,
            status: notification.status,
            createdAt: notification.createdAt
        });

        console.log(`📡 Cancellation notification sent to user ${userId}`);
        return notification;
    } catch (error) {
        console.error('❌ Create event cancellation notification error: ', error);
        throw error;
    }
};

exports.createEventDeletedNotification = async (req, userId, eventId, eventTitle) => {
    try {
        console.log(`🔔 Creating event deleted notification for user ${userId}, event: ${eventTitle}`);
        
        const notification = new Notification({
            userId,
            eventId,
            content: `Sự kiện "${eventTitle}" mà bạn đã đăng ký đã bị hủy bởi ban tổ chức`,
            status: 'unread'
        });

        await notification.save();
        console.log(`💾 Event deleted notification saved to DB: ${notification._id}`);
        
        await notification.populate('eventId', 'title startTime location');

        sendNotificationToUser(req, userId, {
            id: notification._id,
            content: notification.content,
            eventId: notification.eventId,
            status: notification.status,
            createdAt: notification.createdAt
        });

        console.log(`📡 Event deleted notification sent to user ${userId}`);
        return notification;
    } catch (error) {
        console.error('❌ Create event deleted notification error: ', error);
        throw error;
    }
};