const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/index.js');
const bodyParser = require('body-parser');
const { init } = require('./socket'); // Import hàm init từ socket.js

dotenv.config();

const app = express();
const server = init(app); // Khởi tạo server với socket.io

const PORT = process.env.PORT || 3001;

// Cấu hình CORS
const corsOptions = {
    origin: 'https://project-order-food.vercel.app', // Chỉ định miền của bạn
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// Đăng ký routes
routes(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
