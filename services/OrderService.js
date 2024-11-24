const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { getIo } = require('../socket'); 
const { removeCartItems } = require('../services/cartService');
const mongoose = require('mongoose')
const { startOfDay, subDays, isSameDay, format, startOfWeek, endOfWeek, subWeeks, startOfMonth, endOfMonth, subMonths, getISOWeek } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const moment = require('moment-timezone'); // Sử dụng moment-timezone để xử lý múi giờ

const createOrder = async (orderData) => {
    // Kiểm tra các trường bắt buộc trong deliveryInfo
    if (!orderData.deliveryInfo || !orderData.deliveryInfo.name || !orderData.deliveryInfo.phone || !orderData.deliveryInfo.address) {
        throw new Error('deliveryInfo is required and must include name, phone, and address.');
    }
    
    // Kiểm tra cart có ít nhất một sản phẩm
    if (!orderData.cart || !Array.isArray(orderData.cart) || orderData.cart.length === 0) {
        throw new Error('Cart must contain at least one product.');
    }
    
    // Kiểm tra từng sản phẩm trong cart
    orderData.cart.forEach((item, index) => {
        if (!item.name || !item.image || !item.description || !item.quantity || !item.price) {
            throw new Error(`Cart item at index ${index} is missing required fields.`);
        }
    });
    
    // Thiết lập các giá trị mặc định
    orderData.status = 'Chờ xác nhận';
    orderData.driverId = null;
    
    if (!orderData.paymentStatus) {
        orderData.paymentStatus = 'Chưa thanh toán';
    }
    
    const order = new Order(orderData);
    await order.save();
    const userId =  orderData.customerId
    const storeId = orderData.storeId
    const productIdsToRemove = orderData.cart.map(item => item.productId.toString());
    await removeCartItems(userId, storeId, productIdsToRemove);//Xóa các món đã được mua trong giỏ hàng

    const io = getIo(); 
    io.emit('newOrder', order);
    
    return order;
};
//Lấy đơn hàng có trạng thái là Chờ xác nhận
const getOrdersByStatusForCustomer = async (customerId, status = 'Chờ xác nhận') => {
    try {
        const orders = await Order.find({ customerId, status });
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders');
    }
};

const getOrdersByCustomerId = async (customerId) => {
    try {
        const orders = await Order.find({ customerId });
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders');
    }
};

const getOrdersByStoreId = async (storeId) => {
    try {
        const orders = await Order.find({ storeId });
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders');
    }
};
const getOrdersByDriverId = async (driverId) => {
    try {
        const orders = await Order.find({ driverId });
        return orders;
    } catch (error) {
        throw new Error('Error fetching orders');
    }
};

const cancelOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId); // Find the order by ID

        if (!order) {
            throw new Error('Order not found');
        }

        // Check if the current status is 'Chờ xác nhận'
        if (order.status === 'Chờ xác nhận') {
            order.status = 'Đã hủy'; // Update status to 'Đã hủy'
            await order.save(); // Save the updated order
            return { message: 'Order has been canceled successfully' };
        } else {
            throw new Error('Cannot cancel this order, current status is not Chờ xác nhận');
        }
    } catch (error) {
        throw new Error(error.message); // Propagate the error to the controller
    }
};

const acceptOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId); // Tìm đơn hàng theo ID

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra trạng thái hiện tại là 'Chờ xác nhận'
        if (order.status === 'Chờ xác nhận') {
            order.status = 'Đang tìm tài xế'; // Cập nhật trạng thái
            // Gán ngẫu nhiên đơn hàng cho một tài xế
            const assignResult = await assignOrderToRandomDriver(orderId);

            if (!assignResult.success) {
                console.error(assignResult.message);
            } else {
                console.log(`Đơn hàng đã được gửi cho tài xế: ${assignResult.driverId}`);
            }

            await order.save(); // Lưu đơn hàng đã cập nhật
            return { message: 'Order has been accepted successfully' };
        } else {
            throw new Error('Cannot accept this order, current status is not Chờ xác nhận');
        }
    } catch (error) {
        throw new Error(error.message); // Chuyển lỗi lên controller
    }
};
const completeOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId); // Tìm đơn hàng theo ID

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra trạng thái hiện tại là 'Cửa hàng xác nhận'
        if (order.status === 'Đã tìm thấy tài xế') {
            order.status = 'Chờ lấy hàng'; // Cập nhật trạng thái
            await order.save(); // Lưu đơn hàng đã cập nhật
            return { message: 'Order has been completed successfully' };
        } else {
            throw new Error('Cannot complete this order, current status is not Đã tìm thấy tài xế');
        }
    } catch (error) {
        throw new Error(error.message); // Chuyển lỗi lên controller
    }
};
const takeOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId); // Tìm đơn hàng theo ID

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra trạng thái hiện tại là 'Cửa hàng xác nhận'
        if (order.status === 'Chờ lấy hàng') {
            order.status = 'Đang giao'; // Cập nhật trạng thái
            await order.save(); // Lưu đơn hàng đã cập nhật
            return { message: 'Order has been completed successfully' };
        } else {
            throw new Error('Cannot complete this order, current status is not Chờ lấy hàng');
        }
    } catch (error) {
        throw new Error(error.message); // Chuyển lỗi lên controller
    }
};
const shipOrder = async (orderId) => {
    try {
        const order = await Order.findById(orderId); // Tìm đơn hàng theo ID

        if (!order) {
            throw new Error('Order not found');
        }

        // Kiểm tra trạng thái hiện tại là 'Cửa hàng xác nhận'
        if (order.status === 'Đang giao') {
            order.status = 'Hoàn thành'; // Cập nhật trạng thái
            order.paymentStatus='Đã thanh toán'
            await order.save(); // Lưu đơn hàng đã cập nhật
            return { message: 'Order has been completed successfully' };
        } else {
            throw new Error('Cannot complete this order, current status is not Đang giao');
        }
    } catch (error) {
        throw new Error(error.message); // Chuyển lỗi lên controller
    }
};
// Gán đơn hàng ngẫu nhiên cho tài xế
const assignOrderToRandomDriver = async (orderId) => {
    try {
        const drivers = await Driver.find({});
        if (drivers.length === 0) {
            console.error("Không có tài xế nào có sẵn");
            return { success: false, message: 'Không có tài xế nào có sẵn' };
        }

        // Chọn ngẫu nhiên một tài xế
        const randomDriver = drivers[Math.floor(Math.random() * drivers.length)];
        await Order.findByIdAndUpdate(orderId, { 
            driverId: randomDriver._id, 
            status: 'Đang tìm tài xế' 
        });
        // Giả định có cơ chế thông báo cho tài xế về đơn hàng
        console.log(`Đã gửi đơn hàng ${orderId} cho tài xế: ${randomDriver._id}`);

        return { success: true, driverId: randomDriver._id };
    } catch (error) {
        console.error("Lỗi khi gán đơn hàng cho tài xế ngẫu nhiên:", error);
        return { success: false, message: 'Lỗi khi gán đơn hàng cho tài xế ngẫu nhiên' };
    }
};

// Cập nhật trạng thái đơn hàng khi cửa hàng xác nhận
const updateOrderStatusToConfirmed = async (orderId) => {
    try {
        // Cập nhật trạng thái đơn hàng thành 'Đang tìm tài xế'
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Đang tìm tài xế' }, { new: true });

        if (!order) {
            console.error('Không tìm thấy đơn hàng');
            return;
        }

        // Gán ngẫu nhiên đơn hàng cho một tài xế
        const assignResult = await assignOrderToRandomDriver(orderId);

        if (!assignResult.success) {
            console.error(assignResult.message);
        } else {
            console.log(`Đơn hàng đã được gửi cho tài xế: ${assignResult.driverId}`);
        }
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
    }
};

// Xác nhận hoặc từ chối đơn hàng bởi tài xế
const confirmOrRejectOrderByDriver = async (req, res) => {
    const { orderId, driverId, action } = req.body; // `action` là 'confirm' hoặc 'reject'

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (action === 'confirm') {
            // Nếu tài xế xác nhận đơn hàng
            order.driverId = driverId;
            order.status = 'Đã tìm thấy tài xế';
            await order.save();

            return res.status(200).json({ success: true, message: 'Đơn hàng đã được tài xế xác nhận' });
        } else if (action === 'reject') {
            // Nếu tài xế từ chối, gán đơn hàng cho tài xế khác
            order.driverId = null; // Hủy tài xế cũ
            await order.save();

            const newDriverAssignment = await assignOrderToRandomDriver(orderId);
            if (!newDriverAssignment.success) {
                return res.status(500).json({ message: 'Không thể gán tài xế khác cho đơn hàng' });
            }

            // Cập nhật trạng thái đơn hàng khi gán tài xế mới
            order.driverId = newDriverAssignment.driverId;
            order.status = 'Đã tìm thấy tài xế';
            await order.save();

            return res.status(200).json({
                success: true,
                message: `Đơn hàng đã được chuyển cho tài xế mới: ${newDriverAssignment.driverId}`
            });
        } else {
            return res.status(400).json({ message: 'Hành động không hợp lệ' });
        }
    } catch (error) {
        console.error("Lỗi khi xác nhận hoặc từ chối đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi xử lý yêu cầu của tài xế' });
    }
};


//-----------------------
const getPendingOrders = async () => {
    return await Order.find({ status: 'Chờ xác nhận' });
};

const updateOrder = async (orderId, updateData) => {
    return await Order.findByIdAndUpdate(orderId, updateData, { new: true });
};

const findOrdersByDriverAndStatus = async (driverId, status) => {
    try {
        return await Order.find({ driverId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
const findOrdersByDriverAndStatus2 = async (driverId, status) => {
    try {
        return await Order.find({ driverId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};

const findOrdersByStoreAndStatus = async (storeId, status) => {
    try {
        return await Order.find({ storeId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
const findOrdersByStoreAndStatus2 = async (storeId, status) => {
    try {
        return await Order.find({ storeId, status });
    } catch (error) {
        throw new Error('Error fetching orders: ' + error.message);
    }
};
//PressPay
const updatePaymentStatus = async (orderID, status) => {
    const paymentStatus = status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán';
    return await Order.findByIdAndUpdate(orderID, { paymentStatus }, { new: true });
};

const getOrderById = async (id) => {
    try {
        const order = await Order.findById(id); // Sử dụng phương thức tìm theo ID của Mongoose

        return order;
    } catch (error) {
        throw new Error(error.message);
    }
}
const getAllOrders = async (page = 1, limit = 10) => {
    try {
        // Tính toán số lượng đơn hàng cần bỏ qua
        const skip = (page - 1) * limit;

        // Lấy dữ liệu đơn hàng từ MongoDB
        const orders = await Order.find()
            .skip(skip)
            .limit(limit);

        // Trả về kết quả
        return orders;
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        throw new Error('Không thể lấy dữ liệu đơn hàng');
    }
};
const getOrderStatusCounts = async () => {
    try {
        // Lấy tất cả đơn hàng và đảm bảo giá trị `status` tồn tại
        const orders = await Order.find({}, 'status');
        
        // Khởi tạo bộ đếm
        const statusCounts = {
            new: 0,
            processing: 0,
            delivering: 0,
            completed: 0,
            canceled: 0,
        };

        // Đếm số lượng từng trạng thái
        orders.forEach((order) => {
            switch (order.status) {
                case 'Chờ xác nhận':
                    statusCounts.new += 1;
                    break;
                case 'Cửa hàng xác nhận':
                case 'Đang tìm tài xế':
                case 'Đã tìm thấy tài xế':
                case 'Chờ lấy hàng':
                    statusCounts.processing += 1;
                    break;
                case 'Đang giao':
                    statusCounts.delivering += 1;
                    break;
                case 'Hoàn thành':
                    statusCounts.completed += 1;
                    break;
                case 'Đã hủy':
                    statusCounts.canceled += 1;
                    break;
                default:
                    console.warn(`Trạng thái không xác định: ${order.status}`);
            }
        });

        return statusCounts;
    } catch (error) {
        console.error("Lỗi khi lấy số lượng trạng thái đơn hàng:", error);
        throw new Error("Không thể lấy số lượng trạng thái đơn hàng.");
    }
};


module.exports = {
    createOrder,
    getPendingOrders,
    updateOrder,
    findOrdersByDriverAndStatus,
    findOrdersByDriverAndStatus2,
    findOrdersByStoreAndStatus,
    findOrdersByStoreAndStatus2,
    updatePaymentStatus,
    getOrderById, 
    getOrdersByStatusForCustomer, //Lấy đơn hàng có trạng thái là Chờ xác nhận,
    getOrdersByCustomerId,
    cancelOrder,
    getOrdersByStoreId,
    acceptOrder,
    completeOrder,
    assignOrderToRandomDriver,
    confirmOrRejectOrderByDriver,
    updateOrderStatusToConfirmed,
    getOrdersByDriverId,
    takeOrder,
    shipOrder,
    getAllOrders,
    getOrderStatusCounts,
    // Lấy doanh thu theo tuần (Thứ Hai - Chủ Nhật)
    // Lấy doanh thu theo tuần cho từng cửa hàng
    async getWeeklyRevenue(storeId) {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)); // Thứ Hai đầu tuần
        startOfWeek.setHours(0, 0, 0, 0);
    
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Chủ Nhật
        endOfWeek.setHours(23, 59, 59, 999);
    
        // const startOfWeek = startOfWeek(new Date()); // Bắt đầu tuần này
        // const endOfWeek = endOfWeek(new Date()); // Kết thúc tuần này
        console.log(startOfWeek)
        console.log(endOfWeek)

        const revenue = await Order.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    createdAt: { $gte: startOfWeek, $lte: endOfWeek },
                    status: 'Hoàn thành'
                }
            },
            {
                $group: {
                    _id: { $dayOfWeek: "$createdAt" },
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);
    
        // Chuẩn hóa dữ liệu trả về với doanh thu mặc định là 0 cho các ngày không có doanh thu
        const daysOfWeek = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
        const formattedRevenue = Array.from({ length: 7 }, (_, index) => {
            const dayRevenue = revenue.find(item => item._id === (index + 1)); // MongoDB: 1 = Chủ Nhật, 2 = Thứ Hai,...
            return {
                day: daysOfWeek[index],
                totalRevenue: dayRevenue ? dayRevenue.totalRevenue : 0
            };
        });
    
        return formattedRevenue;
    },
    // Lấy doanh thu theo tháng cho từng cửa hàng
    async getMonthlyRevenue(storeId) {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1); // Ngày đầu tiên của năm
        startOfYear.setHours(0, 0, 0, 0);

        const endOfYear = new Date(new Date().getFullYear(), 11, 31); // Ngày cuối cùng của năm
        endOfYear.setHours(23, 59, 59, 999);

        const revenue = await Order.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    createdAt: { $gte: startOfYear, $lte: endOfYear },
                    status: 'Hoàn thành'
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" }, // Lấy tháng từ `createdAt`
                    totalRevenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Chuẩn hóa dữ liệu trả về với doanh thu mặc định là 0 cho các tháng không có doanh thu
        const formattedRevenue = Array.from({ length: 12 }, (_, index) => {
            const monthRevenue = revenue.find(item => item._id === index + 1); // MongoDB: Tháng bắt đầu từ 1
            return {
                month: index + 1, // Tháng 1, 2, ..., 12
                totalRevenue: monthRevenue ? monthRevenue.totalRevenue : 0
            };
        });

        return formattedRevenue;
    },
    // Lấy doanh thu theo năm cho từng cửa hàng
    async getDailyRevenue(storeId) {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Đặt thời gian bắt đầu ngày (0h00)
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Đặt thời gian kết thúc ngày (23h59)

        const revenue = await Order.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: 'Hoàn thành',
                },
            },
            {
                $group: {
                    _id: { $hour: "$createdAt" }, // Nhóm theo giờ
                    totalRevenue: { $sum: "$totalPrice" },
                },
            },
            { $sort: { "_id": 1 } }, // Sắp xếp theo giờ tăng dần
        ]);

        // Chuẩn hóa dữ liệu trả về để đảm bảo đủ 24 giờ
        const formattedRevenue = Array.from({ length: 24 }, (_, hour) => {
            const hourRevenue = revenue.find(item => item._id === hour);
            return {
                hour, // Giờ trong ngày (0-23)
                totalRevenue: hourRevenue ? hourRevenue.totalRevenue : 0,
            };
        });

        return formattedRevenue;
    }, 
    async getSumOrderDaily(storeId) {
        const today = new Date();
        const start = new Date(today);
        start.setHours(0, 0, 0, 0); // Bắt đầu ngày hôm nay (00:00:00)
        const end = new Date(today);
        end.setHours(23, 59, 59, 999); // Kết thúc ngày hôm nay (23:59:59)

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Trừ 1 ngày từ hôm nay
        const startYesterday = new Date(yesterday);
        startYesterday.setHours(0, 0, 0, 0); // Bắt đầu ngày hôm qua (00:00:00)
        const endYesterday = new Date(yesterday);
        endYesterday.setHours(23, 59, 59, 999); // Kết thúc ngày hôm qua (23:59:59)

        // Truy vấn tổng số đơn hàng và tính toán phần trăm thay đổi
        const result = await Order.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    status: { $in: ["Hoàn thành", "Đã hủy"] },
                    createdAt: { $gte: startYesterday, $lt: end }, // Lọc đơn hàng trong 2 ngày
                },
            },
            {
                $group: {
                    _id: {
                        status: "$status",
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, // Nhóm theo trạng thái và ngày
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.status", // Nhóm lại theo trạng thái
                    orders: {
                        $push: { date: "$_id.date", count: "$count" }, // Lưu trữ các ngày và số lượng đơn hàng theo trạng thái
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id", // Trả về trạng thái
                    orders: 1, // Trả về orders
                },
            },
        ]);

        // Tạo một đối tượng với các trạng thái mặc định nếu không có dữ liệu
        const statusData = ["Hoàn thành", "Đã hủy"];
        const resultMap = result.reduce((acc, item) => {
            acc[item.status] = item.orders;
            return acc;
        }, {});

        // Đảm bảo cả "Hoàn thành" và "Đã hủy" đều có dữ liệu
        statusData.forEach(status => {
            if (!resultMap[status]) {
                resultMap[status] = [];
            }
        });

        // Xử lý dữ liệu và tính phần trăm thay đổi
        const formattedResult = statusData.map(status => {
            const orders = resultMap[status];
            let thisDayCount = 0;
            let lastDayCount = 0;

            // Lặp qua các đơn hàng để tìm số lượng cho hôm nay và hôm qua
            orders.forEach(o => {
                const orderDate = new Date(o.date);
                if (isSameDay(orderDate, today)) {
                    thisDayCount = o.count;
                }
                if (isSameDay(orderDate, yesterday)) {
                    lastDayCount = o.count;
                }
            });

            // Tính phần trăm thay đổi
            const percentageChange = lastDayCount === 0
                ? thisDayCount > 0
                    ? 100
                    : 0
                : ((thisDayCount - lastDayCount) / lastDayCount) * 100;

            return {
                status: status,
                thisDayCount: thisDayCount,
                lastDayCount: lastDayCount,
                percentageChange: percentageChange.toFixed(2), // Làm tròn phần trăm
            };
        });

        return formattedResult;
    }
    ,
    async getSumOrderWeek(storeId) {
        // Lấy ngày bắt đầu và kết thúc của tuần này và tuần trước
        const startOfThisWeek = startOfWeek(new Date()); // Bắt đầu tuần này
        const endOfThisWeek = endOfWeek(new Date()); // Kết thúc tuần này
        const startOfLastWeek = startOfWeek(subWeeks(new Date(), 1)); // Bắt đầu tuần trước
        const endOfLastWeek = endOfWeek(subWeeks(new Date(), 1)); // Kết thúc tuần trước

        // Pipeline aggregate để lấy tổng số đơn hàng tuần này và tuần trước
        const sumOrder = await Order.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    status: { $in: ["Hoàn thành", "Đã hủy"] },
                    createdAt: { $gte: startOfLastWeek, $lte: endOfThisWeek } // Lọc đơn hàng trong 2 tuần gần đây
                },
            },
            {
                $group: {
                    _id: { status: "$status", week: { $isoWeek: "$createdAt" } }, // Nhóm theo trạng thái và tuần
                    count: { $sum: 1 }
                },
            },
            {
                $group: {
                    _id: "$_id.status", // Nhóm lại theo trạng thái
                    orders: { 
                        $push: { week: "$_id.week", count: "$count" } // Lưu trữ các tuần và số lượng đơn hàng theo trạng thái
                    }
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id", // Trả về status
                    orders: 1 // Trả về orders
                },
            },
        ]);

        // Tính phần trăm thay đổi
        const result = sumOrder.map(order => {
            let thisWeekCount = 0;
            let lastWeekCount = 0;

            // Lặp qua các đơn hàng để tìm số lượng cho tuần này và tuần trước
            order.orders.forEach(o => {
                if (o.week === getISOWeek(new Date())) { // So sánh tuần này
                    thisWeekCount = o.count;
                }
                if (o.week === getISOWeek(subWeeks(new Date(), 1))) { // So sánh tuần trước
                    lastWeekCount = o.count;
                }
            });

            // Tính phần trăm thay đổi
            const percentageChange = lastWeekCount === 0 
                ? thisWeekCount > 0 ? 100 : 0
                : ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100;

            return {
                status: order.status,
                thisWeekCount: thisWeekCount,
                lastWeekCount: lastWeekCount,
                percentageChange: percentageChange.toFixed(2), // Làm tròn phần trăm
            };
        });

        return result;
    }
    ,
    async getSumOrderMonth(storeId) {
        // Lấy tháng này và tháng trước
        const startOfThisMonth = startOfMonth(new Date()); // Bắt đầu tháng này
        const endOfThisMonth = endOfMonth(new Date()); // Kết thúc tháng này
        const startOfLastMonth = startOfMonth(subMonths(new Date(), 1)); // Bắt đầu tháng trước
        const endOfLastMonth = endOfMonth(subMonths(new Date(), 1)); // Kết thúc tháng trước

        const sumOrder = await Order.aggregate([
            {
                $match: {
                    storeId: new mongoose.Types.ObjectId(storeId),
                    status: { $in: ["Hoàn thành", "Đã hủy"] },
                    createdAt: { $gte: startOfLastMonth } // Lọc tất cả đơn hàng trong 2 tháng gần đây
                },
            },
            {
                $group: {
                    _id: { status: "$status", month: { $month: "$createdAt" } }, // Nhóm theo trạng thái và tháng
                    count: { $sum: 1 }
                },
            },
            {
                $group: {
                    _id: "$_id.status", // Nhóm lại theo trạng thái
                    orders: { 
                        $push: { month: "$_id.month", count: "$count" } // Lưu trữ các tháng và số lượng đơn hàng theo trạng thái
                    }
                },
            },
            {
                $project: {
                    _id: 0,
                    status: "$_id", // Trả về status
                    orders: 1 // Trả về orders
                },
            },
        ]);

        // Tính phần trăm thay đổi
        const result = sumOrder.map(order => {
            let thisMonthCount = 0;
            let lastMonthCount = 0;

            // Lặp qua các đơn hàng để tìm số lượng cho tháng này và tháng trước
            order.orders.forEach(o => {
                if (o.month === startOfThisMonth.getMonth() + 1) { // Lưu ý rằng tháng bắt đầu từ 0
                    thisMonthCount = o.count;
                }
                if (o.month === startOfLastMonth.getMonth() + 1) {
                    lastMonthCount = o.count;
                }
            });

            // Tính phần trăm thay đổi
            const percentageChange = lastMonthCount === 0 
                ? thisMonthCount > 0 ? 100 : 0
                : ((thisMonthCount - lastMonthCount) / lastMonthCount) * 100;

            return {
                status: order.status,
                thisMonthCount: thisMonthCount,
                lastMonthCount: lastMonthCount,
                percentageChange: percentageChange.toFixed(2), // Làm tròn phần trăm
            };
        });

        return result;
    }
    ,
    async getTop5Product(storeId){
        const start = startOfMonth(new Date()); // Bắt đầu tháng này
        const end = endOfMonth(new Date()); // Kết thúc tháng này

        const result = await Order.aggregate([
            {
              $match: {
                storeId: new mongoose.Types.ObjectId(storeId), // Lọc theo storeId
                status: 'Hoàn thành', 
                createdAt: { $gte: start, $lt: end }, // Lọc theo khoảng thời gian
              },
            },
            {
              $unwind: "$cart", // Tách các sản phẩm trong giỏ hàng
            },
            {
              $group: {
                _id: "$cart.productId", // Nhóm theo productId
                name: { $first: "$cart.name" }, // Lấy tên sản phẩm đầu tiên
                photo: { $first: "$cart.image"},
                price: { $first: "$cart.price"},
                totalSold: { $sum: "$cart.quantity" }, // Tổng số lượng bán
              },
            },
            {
              $sort: { totalSold: -1 }, // Sắp xếp giảm dần theo số lượng bán
            },
            {
              $facet: {
                topProducts: [{ $limit: 5 }], // Lấy 5 sản phẩm bán chạy nhất
                others: [
                  { $skip: 5 },
                  { $group: { _id: "Other", totalSold: { $sum: "$totalSold" } } }, // Gộp các sản phẩm còn lại
                ],
              },
            },
          ]);
                            
        return result;
    }
};
