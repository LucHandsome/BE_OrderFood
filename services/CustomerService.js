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
        clientId: '66f47f24b47c42cc24d6b336',
        clientSecret: '866f22a1c995e42d7d172b4b',
        callbackUrl: '.'
    });

    try {
        const token = await pointer.getAccessToken(code);
        const user = await pointer.getUser(token.accessToken);

        console.log('Thông tin người dùng:', user);

        let existingCustomer = await Customer.findOne({ email: user.email });
        
        if (!existingCustomer) {
            existingCustomer = await Customer.create({
                email: user.email,
                dateOfBirth: user.dateOfBirth || new Date(),
                gender: user.gender || 'Khác',
                customerName: user.name,
                profileImage: user.profileImage || '',
                password: 'SSO_USER',
            });
            console.log('Tài khoản mới đã được tạo:', existingCustomer); // Kiểm tra tài khoản mới tạo
        } else {
            console.log('Tài khoản đã tồn tại:', existingCustomer); // Kiểm tra tài khoản đã tồn tại
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
