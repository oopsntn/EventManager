const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');

const server = express();
const PORT = process.env.PORT || 9999;
const HOST = process.env.HOST || 'localhost';

// Middleware
server.use(cors());
server.use(express.json());

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
server.use('/admin', require('./routes/admin.route'));
// Route gốc
server.get('/', (req, res) => {
  res.send('Backend ExpressJS chạy OK!');
});

// Lắng nghe cổng
server.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
