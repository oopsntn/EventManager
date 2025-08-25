const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const mongoose = require('mongoose');
const path = require("path");
const session = require('express-session');
const passport = require('./middleware/passport');
const server = express();
const httpServer = http.createServer(server);

const io = socketIo(httpServer, {
  cors: {
    origin: "*", // Trong production nên chỉ định cụ thể
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 9999;
const HOST = process.env.HOST || 'localhost';

// Middleware
server.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
server.use(express.json());
server.use("/uploads", express.static(path.join(__dirname, "uploads")));

server.use(session({
  secret: process.env.SESSION_SECRET ? 'LOADED ✅' : 'MISSING ❌',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true nếu dùng HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
server.use(passport.initialize());
server.use(passport.session());
// 🔥 Map để lưu userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join_user', (userId) => {
    console.log(`👤 User ${userId} joining with socket ${socket.id}`);
    
    userSockets.set(userId.toString(), socket.id);
    socket.userId = userId;
    
    // Join user vào room riêng (optional, để backup)
    socket.join(`user_${userId}`);
    
    console.log(`✅ User ${userId} connected successfully`);
    console.log('📊 Current connected users:', Array.from(userSockets.keys()));
  });

  // 🧪 Test ping-pong
  socket.on('ping', () => {
    console.log('🏓 Ping received from', socket.id);
    socket.emit('pong');
  });

  socket.on('disconnect', () => {
    if(socket.userId){
      userSockets.delete(socket.userId.toString());
      console.log(`👋 User ${socket.userId} disconnected`);
      console.log('📊 Remaining users:', Array.from(userSockets.keys()));
    }
  });

  socket.on('mark_notification_read', async (notificationId) => {
    try {
      const Notification = require('./models/notification');
      await Notification.findByIdAndUpdate(notificationId, {status: 'read'});
      
      // Emit to all sockets of the same user
      socket.emit('notification_marked_read', notificationId);
      console.log(`📖 Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  });
});

// Lưu io và userSockets để sử dụng trong controllers
server.set('io', io);
server.set('userSockets', userSockets);

// 🧪 Debug endpoint
server.get('/api/debug/connected-users', (req, res) => {
  res.json({
    connectedUsers: Array.from(userSockets.keys()),
    totalConnections: userSockets.size,
    socketIds: Array.from(userSockets.values())
  });
});

// Kết nối MongoDB
mongoose.connect(`${process.env.MONGO_URL}${process.env.DBNAME}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error);
  });

// Middleware log requests
server.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
server.use('/api/users', require('./routes/user.route'));
server.use('/api/auth', require('./routes/auth.route'));
server.use('/api/events', require('./routes/event.route'));
server.use('/api/notifications', require('./routes/notification.route'));
server.use('/admin', require('./routes/admin.route'));
server.use("/api/home", require("./routes/home.route"));
server.use("/api/registrations", require("./routes/registration.route"));

// Route gốc
server.get('/', (req, res) => {
  res.send('Backend ExpressJS chạy OK!');
});

// 🔥 Sửa: Dùng httpServer.listen thay vì server.listen
httpServer.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running at http://${HOST}:${PORT}`);
  console.log(`🔌 Socket.IO server is ready`);
});
