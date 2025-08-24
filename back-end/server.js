const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
<<<<<<< Updated upstream
=======
const path = require("path");
>>>>>>> Stashed changes

const server = express();
const PORT = process.env.PORT || 9999;
const HOST = process.env.HOST || 'localhost';

// Middleware
server.use(cors());
server.use(express.json());
<<<<<<< Updated upstream

=======
server.use("/uploads", express.static(path.join(__dirname, "uploads")));

const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected: ', socket.id);

  socket.on('user_login', (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    if(socket.userId){
      userSockets.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });

  socket.on('mark_notification_read', async (notificationId) => {
    try {
      const Notification = require('./models/notification');
      await Notification.findByIdAndUpdate(notificationId, {status: 'read'});
      socket.emit('notification_marked_read', notificationId);
    } catch (error) {
      console.error('Error marking notification as read: ', error);
    }
  });
});

server.set('io', io);
server.set('userSockets', userSockets);
>>>>>>> Stashed changes
// Kết nối MongoDB
mongoose.connect(`${process.env.MONGO_URL}${process.env.DBNAME}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error);
  });
server.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
// Routes
server.use('/api/users', require('./routes/user.route'));
server.use('/api/auth', require('./routes/auth.route'));
server.use('/api/events', require('./routes/event.route'));
<<<<<<< Updated upstream

=======
server.use('/api/notifications', require('./routes/notification.route'));
server.use('/admin', require('./routes/admin.route'));
server.use("/api/home", require("./routes/home.route"));
server.use("/api/registrations", require("./routes/registration.route"));
>>>>>>> Stashed changes
// Route gốc
server.get('/', (req, res) => {
  res.send('Backend ExpressJS chạy OK!');
});

// Lắng nghe cổng
server.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
