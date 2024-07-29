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

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit process with failure
  });


app.use(bodyParser.json());
app.use(cors()); // Cho phép tất cả các nguồn gốc
app.get('/',(req,res)=>{
  res.json({message:'Hello world'})
})
// Định nghĩa các routes
routes(app);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
