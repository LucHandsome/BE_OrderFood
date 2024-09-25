const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signUpCustomer = async (customerData) => {
    const { email, password, ...otherData } = customerData;

    // Kiểm tra xem email đã tồn tại chưa
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
        throw new Error('Email đã tồn tại.');
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const newCustomer = new Customer({
        email,
        password: hashedPassword,
        ...otherData
    });

    await newCustomer.save();

    return { message: 'Đăng ký thành công', data: newCustomer };
};

const signInCustomer = async ({ email, password }) => {
    const customer = await Customer.findOne({ email });
    if (!customer) {
        throw new Error('Email hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không đúng');
    }

    const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // Trả về thông tin khách hàng cần thiết, ví dụ: id, name, email
    const customerData = {
        id: customer._id,
        name: customer.name, // Đảm bảo tên khách hàng được bao gồm
        email: customer.email,
    };

    return { message: 'Đăng nhập thành công', token, data: customerData };
};



const updateCustomer = async (customerId, updateData) => {
    const customer = await Customer.findByIdAndUpdate(customerId, updateData, { new: true });
    if (!customer) {
        throw new Error('Khách hàng không tồn tại');
    }
    return { message: 'Cập nhật thành công', data: customer };
};

const getCustomerById = async (customerId) => {
    const customer = await Customer.findById(customerId);
    if (!customer) {
        throw new Error('Khách hàng không tồn tại');
    }
    return { message: 'Lấy thông tin thành công', data: customer };
};

const getAllCustomers = async () => {
    const customers = await Customer.find();
    return { message: 'Lấy tất cả khách hàng thành công', data: customers };
};
// Thêm hàm mới để xử lý đăng nhập qua SSO
const signInWithSSO = async (code) => {
    const pointer = new PointerStrategy({
        clientId: '66f45beb2b1d190d4d448637',  // Đã thay đổi clientId
        clientSecret: '0c6e42fa7695bf7858930478', // Đã thay đổi clientSecret
        callbackUrl: '.', // URL mà Pointer chuyển hướng về sau khi đăng nhập thành công
    });

    try {
        // Lấy access token từ mã xác thực (code) gửi từ Frontend
        const token = await pointer.getAccessToken(code);
        
        // Lấy thông tin người dùng từ access token
        const user = await pointer.getUser(token.accessToken);

        // Kiểm tra xem người dùng đã tồn tại trong hệ thống chưa
        let existingCustomer = await Customer.findOne({ email: user.email });

        if (!existingCustomer) {
            // Nếu chưa có tài khoản, tạo tài khoản mới
            existingCustomer = await Customer.create({
                email: user.email,
                dateOfBirth: user.dateOfBirth || new Date(), // Có thể thêm thông tin này nếu có
                gender: user.gender || 'Khác',
                customerName: user.name,
                profileImage: user.profileImage || '',
                password: 'SSO_USER', // Người dùng đăng nhập bằng SSO sẽ không cần mật khẩu
            });
        }

        // Tạo JWT token cho người dùng
        const jwtToken = jwt.sign({ id: existingCustomer._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        return {
            message: 'Đăng nhập thành công qua SSO',
            token: jwtToken,
            data: {
                id: existingCustomer._id,
                email: existingCustomer.email,
                name: existingCustomer.customerName
            }
        };
    } catch (error) {
        console.error('Lỗi khi đăng nhập qua SSO:', error);
        throw new Error('Đăng nhập qua SSO không thành công.');
    }
};
module.exports = {
    signUpCustomer,
    signInCustomer,
    updateCustomer,
    getCustomerById,
    getAllCustomers,
    signInWithSSO
};
