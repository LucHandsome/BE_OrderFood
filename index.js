const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/index.js');
const bodyParser = require('body-parser');
const { init } = require('./socket'); // Import hàm init từ socket.js
const { PointerStrategy } = require("oauth-pointer");


dotenv.config();

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

app.use(bodyParser.json());
// app.use(cors({
//     origin: 'https://project-order-food.vercel.app', // Thay bằng miền frontend của bạn
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức được phép
//     credentials: true // Nếu bạn cần gửi cookie hoặc thông tin xác thực
// }));
app.use(cors());
routes(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
