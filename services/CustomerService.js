const Customer = require('../models/Customer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import { PointerStrategy } from "oauth-pointer";

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
        clientId: '66f52f6a37370353ddcc9b3d',
        clientSecret: '08ef0cd03d588dc8d09795c1',
        callbackUrl: 'https://order-app-88-037717b27b20.herokuapp.com/api/customers/sign-in-sso'
    });

    try {
        const token = await pointer.getAccessToken(code);
        const user = await pointer.getUser(token.accessToken);

        console.log('Thông tin người dùng:', user);

        // Chỉ lấy username và email
        const { email, username } = user;

        let existingCustomer = await Customer.findOne({ email });
        
        if (!existingCustomer) {
            // Nếu chưa tồn tại, tạo mới
            existingCustomer = await Customer.create({
                email,
                customerName: username || 'Khách hàng', // Sử dụng username hoặc tên mặc định
                password: 'SSO_USER', // Mật khẩu không cần mã hóa
            });
            console.log('Tài khoản mới đã được tạo:', existingCustomer);
        } else {
            console.log('Tài khoản đã tồn tại:', existingCustomer);
        }

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
        console.error('Lỗi khi đăng nhập qua SSO:', error.message || error);
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
