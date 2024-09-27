const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/index.js');
const bodyParser = require('body-parser');
const { init } = require('./socket'); // Import hàm init từ socket.js
const { PointerStrategy } = require("oauth-pointer");


dotenv.config();

app.use(express.json()); // Thay thế body-parser

const app = express();
const server = init(app); // Khởi tạo server với socket.io
mongoose.connect(process.env.MONGODB_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    serverSelectionTimeoutMS: 50000 // Tăng thời gian chờ nếu cần
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Failed to connect to MongoDB', err));
  
const PORT = process.env.PORT || 3000;

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

const corsOptions = {
    origin: 'https://project-order-food.vercel.app', // Địa chỉ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Bao gồm phương thức OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'], // Header được phép
    credentials: true // Nếu cần sử dụng cookie
};

app.use(cors(corsOptions));

// Đoạn xử lý yêu cầu preflight (OPTIONS) cho tất cả các route
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'https://project-order-food.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.send(); // Kết thúc phản hồi với mã 200
});
routes(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
