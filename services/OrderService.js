const Order = require('../models/Order');
const Driver = require('../models/Driver');
const { getIo } = require('../socket'); 
const { removeCartItems } = require('../services/cartService');
const mongoose = require('mongoose')

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
    // Lấy doanh thu theo tuần (Thứ Hai - Chủ Nhật)
    // Lấy doanh thu theo tuần cho từng cửa hàng
async getWeeklyRevenue(storeId) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Bắt đầu từ Thứ Hai
    startOfWeek.setHours(0, 0, 0, 0);  // Đặt lại thời gian về 00:00:00
  console.log(storeId)
    const endOfWeek = new Date();
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Kết thúc vào Chủ Nhật
    endOfWeek.setHours(23, 59, 59, 999);  // Đặt lại thời gian về 23:59:59
  
    console.log("Start of week:", startOfWeek.toISOString());
    console.log("End of week:", endOfWeek.toISOString());

    const revenue = await Order.aggregate([
      {
        $match: {
            storeId: storeId,
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
  console.log("doanh thu"+revenue)
    return revenue;
  },
  
  // Lấy doanh thu theo tháng cho từng cửa hàng
  async getMonthlyRevenue(storeId) {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
  
    const revenue = await Order.find([
      {
        $match: {
          storeId: storeId,  // Lọc theo storeId
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'Hoàn thành'
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  
    return revenue;
  },
  
  // Lấy doanh thu theo năm cho từng cửa hàng
  async getYearlyRevenue(storeId) {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear() + 1, 0, 0);
  
    const revenue = await Order.aggregate([
      {
        $match: {
          storeId: storeId,  // Lọc theo storeId
          createdAt: { $gte: startOfYear, $lte: endOfYear },
          status: 'Hoàn thành'
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalRevenue: { $sum: "$totalPrice" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
  
    return revenue;
  }
  
};
