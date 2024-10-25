const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/index.js');
const bodyParser = require('body-parser');
const { init } = require('./socket'); // Import hàm init từ socket.js
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();
const server = init(app); // Khởi tạo server với socket.io

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(cookieParser());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 50000 // Tăng thời gian chờ nếu cần
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));

const PORT = process.env.PORT || 3000;

// Cấu hình CORS
const corsOptions = {
    origin: ['http://localhost:1306','https://be-order-food.vercel.app/api/user/sso/callback','https://oggee-food-fe.vercel.app/'], // Địa chỉ frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Bao gồm cả phương thức OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'], // Header được phép
    credentials: true // Cho phép cookie hoặc thông tin xác thực
};

app.use(cors(corsOptions)); // Sử dụng CORS với cấu hình
app.options('*', cors(corsOptions)); // Xử lý yêu cầu preflight

// Routes
routes(app);

// Xử lý lỗi chung
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

// Khởi chạy server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
