const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes/index.js');
const bodyParser = require('body-parser');
const data = require('./Data/data.js');
const { init } = require('./socket'); // Import hàm init từ socket.js

dotenv.config();

const app = express();
const server = init(app); // Khởi tạo server với socket.io

const PORT = process.env.PORT || 3001;

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

app.use(bodyParser.json());
app.use(cors()); // Cho phép tất cả các nguồn gốc
routes(app);

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
