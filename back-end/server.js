const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const server = express();
const PORT = process.env.PORT||3000;
const HOST = process.env.HOST||'localhost'; ;
mongoose.connect(`${process.env.MONGO_URL}${process.env.DBNAME}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
  })
  .catch((error) => {
    console.error('❌ Error connecting to MongoDB:', error);
  });
server.use(cors());
server.use(express.json());



server.use('/api', require('./routes/UserRoutes'));

server.get('/', (req, res) => {
  res.send('Backend ExpressJS chạy OK!');
});

server.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});
