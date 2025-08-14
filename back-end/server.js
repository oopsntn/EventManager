const express = require('express');
const cors = require('cors');
require('dotenv').config();

const server = express();
const PORT = process.env.PORT || 5000;

server.use(cors());
server.use(express.json());

server.get('/', (req, res) => {
  res.send('Backend ExpressJS chạy OK!');
});

server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
