// middleware/upload.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../cloudinaryConfig');

// Cấu hình Cloudinary Storage cho Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ratings', // Thư mục trên Cloudinary để lưu ảnh (có thể thay đổi)
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const driverStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'drivers', // New folder specifically for driver images
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const userStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'users', // New folder specifically for driver images
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});
const uploadUserImages = multer({ storage: userStorage });
const uploadDriverImages = multer({ storage: driverStorage });
const upload = multer({ storage: storage });

module.exports = { uploadDriverImages,upload,uploadUserImages };