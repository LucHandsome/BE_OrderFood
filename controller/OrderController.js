const orderService = require('../services/OrderService');
const Order = require('../models/Order')
const Driver = require('../models/Driver')
const Store = require('../models/Store')
const redisClient = require("../redisClient")
const paymentService = require('../services/paymentservice')
const { calculateRevenue } = require('../services/OrderService');

// calculateRevenue();
const createOrder = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Ghi log chi tiết request
        
        // Kiểm tra nhanh các trường bắt buộc trong req.body trước khi gọi service
        const { deliveryInfo, cart, totalPrice, totalShip, storeId, paymentMethod } = req.body;

        if (!deliveryInfo || !deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
            return res.status(400).json({ status: 'ERROR', message: 'Delivery info is incomplete.' });
        }

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ status: 'ERROR', message: 'Cart must contain at least one product.' });
        }

        if (typeof totalPrice !== 'number' || typeof totalShip !== 'number' || !storeId || !paymentMethod) {
            return res.status(400).json({ status: 'ERROR', message: 'Total price, shipping cost, store ID, and payment method are required.' });
        }

        // Gọi orderService để tạo đơn hàng
        const order = await orderService.createOrder(req.body);

        res.status(201).json({ status: 'OK', data: order });
    } catch (error) {
        console.error('Error creating order:', error.message);
        res.status(500).json({ status: 'ERROR', message: 'Error creating order. Please try again.' });
    }
};

const getOrdersByStatusForCustomer = async (req, res) => {
    const customerId = req.params.customerId;
    try {
        const orders = await orderService.getOrdersByStatusForCustomer(customerId);
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrdersByCustomerId = async (req, res) => {
    const customerId = req.params.customerId; // Get customerId from request parameters
    try {
        const orders = await orderService.getOrdersByCustomerId(customerId); // Call the service to get orders
        res.status(200).json(orders); // Respond with the orders
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle any errors that occur
    }
};
const getOrdersByStoreId = async (req, res) => {
    const storeId = req.params.storeId; // Get customerId from request parameters
    try {
        const orders = await orderService.getOrdersByStoreId(storeId); // Call the service to get orders
        res.status(200).json(orders); // Respond with the orders
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle any errors that occur
    }
};
const getOrdersByDriverId = async (req, res) => {
    const driverId = req.params.driverId; // Get customerId from request parameters
    try {
        const orders = await orderService.getOrdersByDriverId(driverId); // Call the service to get orders
        res.status(200).json(orders); // Respond with the orders
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle any errors that occur
    }
};
const cancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const result = await orderService.cancelOrder(orderId); // Call the service method
        res.status(200).json(result); // Respond with success message
    } catch (error) {
        if (error.message === 'Order not found') {
            return res.status(404).json({ error: error.message }); // Handle order not found
        }
        if (error.message.includes('Cannot cancel')) {
            return res.status(400).json({ error: error.message }); // Handle status check error
        }
        return res.status(500).json({ error: error.message }); // Handle server errors
    }
};
const acceptOrder = async (req, res) => {
    const { orderId } = req.params; // Lấy orderId từ tham số URL

    try {
        const result = await orderService.acceptOrder(orderId); // Gọi hàm acceptOrder
        res.status(200).json(result); // Trả về phản hồi thành công
    } catch (error) {
        res.status(400).json({ message: error.message }); // Trả về lỗi
    }
};
const completeOrder = async (req, res) => {
    const { orderId } = req.params; // Lấy orderId từ tham số URL

    try {
        const result = await orderService.completeOrder(orderId); // Gọi hàm completeOrder
        res.status(200).json(result); // Trả về phản hồi thành công
    } catch (error) {
        res.status(400).json({ message: error.message }); // Trả về lỗi
    }
};
const updateOrderRatingStatus = async (req, res) => {
    try {
      const orderId = req.params.id;
      const { hasRated } = req.body;
  
      const order = await Order.findByIdAndUpdate(
        orderId,
        { hasRated: hasRated },
        { new: true } // Trả về bản ghi đã được cập nhật
      );
  
      if (!order) {
        return res.status(404).json({ message: 'Đơn hàng không tồn tại' });
      }
  
      res.status(200).json({ message: 'Cập nhật trạng thái đánh giá thành công', order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi cập nhật đơn hàng' });
    }
  };


  // Gán đơn hàng ngẫu nhiên cho tài xế
// Gán đơn hàng ngẫu nhiên cho tài xế
const assignOrderToRandomDriver = async (orderId) => {
    try {
        const drivers = await Driver.find({});
        if (drivers.length === 0) {
            console.error("Không có tài xế nào có sẵn");
            return { success: false, message: 'Không có tài xế nào có sẵn' };
        }

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
const updateOrderStatusToConfirmed = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findByIdAndUpdate(orderId, { status: 'Đang tìm tài xế' }, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        const assignResult = await assignOrderToRandomDriver(orderId);

        if (!assignResult.success) {
            return res.status(500).json({ message: assignResult.message });
        }

        res.status(200).json({ message: `Đơn hàng đã được gửi cho tài xế: ${assignResult.driverId}` });
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái đơn hàng' });
    }
};

// Xác nhận hoặc từ chối đơn hàng bởi tài xế
const confirmOrRejectOrderByDriver = async (req, res) => {
    const { orderId, driverId, action } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }

        if (action === 'confirm') {
            order.driverId = driverId;
            order.status = 'Đã tìm thấy tài xế';
            await order.save();

            return res.status(200).json({ message: 'Đơn hàng đã được tài xế xác nhận' });
        } else if (action === 'reject') {
            // Hủy bỏ tài xế hiện tại
            order.driverId = null;
            await order.save();

            const newDriverAssignment = await assignOrderToRandomDriver(orderId);
            if (!newDriverAssignment.success) {
                return res.status(500).json({ message: 'Không thể gán tài xế khác cho đơn hàng' });
            }

            return res.status(200).json({
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
const getAssignedOrders = async (req, res) => {
    const { driverId } = req.params;

    try {
        // Find orders with status "Cửa hàng xác nhận" and the specific driverId
        const orders = await Order.find({
            driverId: driverId,
            status: "Đang tìm tài xế"
        }).populate('cart.productId').populate('storeId'); // Populate product and store info if needed

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching assigned orders:", error);
        res.status(500).json({ message: 'Error fetching assigned orders' });
    }
};
const takeOrder = async (req, res) => {
    const { orderId } = req.params; // Lấy orderId từ tham số URL

    try {
        const result = await orderService.takeOrder(orderId); // Gọi hàm completeOrder
        res.status(200).json(result); // Trả về phản hồi thành công
    } catch (error) {
        res.status(400).json({ message: error.message }); // Trả về lỗi
    }
};
const shipOrder = async (req, res) => {
    const { orderId } = req.params; // Lấy orderId từ tham số URL

    try {
        const result = await orderService.shipOrder(orderId); // Gọi hàm completeOrder
        res.status(200).json(result); // Trả về phản hồi thành công
    } catch (error) {
        res.status(400).json({ message: error.message }); // Trả về lỗi
    }
};
//---------------------------------
const getPendingOrders = async (req, res) => {
    try {
        const pendingOrders = await orderService.getPendingOrders();
        res.status(200).json({ status: 'OK', data: pendingOrders });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ status: 'ERROR', message: error });
    }
};

const updateOrder = async (req, res) => {
    const { orderId } = req.params;
    const updateData = req.body;

    try {
        const updatedOrder = await orderService.updateOrder(orderId, updateData);
        if (updatedOrder) {
            res.status(200).json({ status: 'OK', data: updatedOrder });
        } else {
            res.status(404).json({ status: 'ERROR', message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
};


const getOrdersByDriverAndStatus = async (req, res) => {
    const { driverId, status } = req.query;

    if (!driverId || !status) {
        return res.status(400).json({
            status: 'ERR',
            message: 'driverId and status are required'
        });
    }

    try {
        const orders = await orderService.findOrdersByDriverAndStatus(driverId, status);

        if (!orders.length) {
            return res.status(404).json({
                status: 'ERR',
                message: 'No orders found'
            });
        }

        res.json({
            status: 'OK',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};


const getOrdersByDriverAndStatus2 = async (req, res) => {
    const { driverId, status } = req.query;

    if (!driverId || !status) {
        return res.status(400).json({
            status: 'ERR',
            message: 'driverId and status are required'
        });
    }

    try {
        const orders = await orderService.findOrdersByDriverAndStatus(driverId, status);

        if (!orders.length) {
            return res.status(404).json({
                status: 'ERR',
                message: 'No orders found'
            });
        }

        res.json({
            status: 'OK',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};

const getOrdersByStoreAndStatus = async (req, res) => {
    const { storeId, status } = req.query;

    if (!storeId || !status) {
        return res.status(400).json({
            status: 'ERR',
            message: 'storeId and status are required'
        });
    }

    try {
        const orders = await orderService.findOrdersByStoreAndStatus(storeId, status);

        if (!orders.length) {
            return res.status(404).json({
                status: 'ERR',
                message: 'No orders found'
            });
        }

        res.json({
            status: 'OK',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};

const getOrdersByStoreAndStatus2 = async (req, res) => {
    const { storeId, status } = req.query;

    if (!storeId || !status) {
        return res.status(400).json({
            status: 'ERR',
            message: 'storeId and status are required'
        });
    }

    try {
        const orders = await orderService.findOrdersByStoreAndStatus(storeId, status);

        if (!orders.length) {
            return res.status(404).json({
                status: 'ERR',
                message: 'No orders found'
            });
        }

        res.json({
            status: 'OK',
            data: orders
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};

const handlePressPayCallback = async (req, res) => {
    const { orderID, status } = req.body;

    if (!orderID || !status) {
        return res.status(400).json({ message: 'orderID và status là bắt buộc' });
    }

    try {
        // Cập nhật trạng thái thanh toán của đơn hàng
        const updatedOrder = await orderService.updatePaymentStatus(orderID, status);

        if (updatedOrder) {
            res.status(200).json({ message: 'Trạng thái thanh toán đã được cập nhật thành công', order: updatedOrder });
        } else {
            res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
        }
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái thanh toán' });
    }
};

const getOrderStatus = async (req, res) => {
    const { orderID } = req.params;

    try {
        const order = await orderService.getOrderById(orderID); // Gọi service để tìm đơn hàng
        if (order) {
            res.status(200).json({ paymentStatus: order.paymentStatus }); // Trả về trạng thái thanh toán
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ message: error.message });
    }
}

const getOrderInfo = async (req, res) => {
    try {
        // Extract orderId from route parameters
        const { orderId } = req.params;

        // Validate orderId
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        // Find the order by ID
        const order = await Order.findById(orderId);

        // Check if order exists
        if (order) {
            return res.status(200).json(order); // Return order information
        } else {
            return res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        // Handle unexpected errors
        console.error('Error fetching order:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// const getAllOrder = async (req, res) => {
//     try {
//       // Kiểm tra dữ liệu đã được cache trong Redis chưa
//       const cachedOrders = await redisClient.get("allOrders");
  
//       if (cachedOrders) {
//         console.log("Fetching from cache...");
//         // Dữ liệu đã được cache, trả về dữ liệu từ Redis
//         return res.status(200).json(JSON.parse(cachedOrders));
//       }
  
//       console.log("Fetching from database...");
//       // Nếu chưa có dữ liệu trong Redis, lấy từ MongoDB
//       const orders = await Order.find();
  
//       // Lưu dữ liệu vào Redis với thời gian hết hạn là 10 phút (600 giây)
//       await redisClient.set("allOrders", JSON.stringify(orders), {
//         EX: 600, // Expiration time in seconds
//       });
  
//       // Trả về dữ liệu từ MongoDB
//       return res.status(200).json(orders);
//     } catch (error) {
//       console.error("Error fetching orders:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };

const getAllOrders = async (req, res) => {
    const { page, limit } = req.query;

    try {
        // Gọi service để lấy đơn hàng
        const orders = await orderService.getAllOrders(parseInt(page), parseInt(limit));

        // Trả về kết quả cho client
        res.status(200).json(orders);
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getPendingOrders,
    updateOrder,
    getOrdersByDriverAndStatus,
    getOrdersByDriverAndStatus2,
    getOrdersByStoreAndStatus,
    getOrdersByStoreAndStatus2,
    handlePressPayCallback,
    getOrderStatus,
    getOrdersByStatusForCustomer ,//Lấy đơn hàng có trạng thái là Chờ xác nhận
    getOrdersByCustomerId,
    cancelOrder,
    getOrdersByStoreId,
    acceptOrder,
    completeOrder,
    updateOrderRatingStatus,
    assignOrderToRandomDriver,
    confirmOrRejectOrderByDriver,
    updateOrderStatusToConfirmed,
    getAssignedOrders,
    getOrdersByDriverId,
    takeOrder,
    shipOrder,
    getAllOrders,
    getOrderInfo,
  async getWeeklyRevenue(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      console.log("id: " + storeId)
      const revenue = await orderService.getWeeklyRevenue(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo tuần' });
    }
  },
  async getMonthlyRevenue(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getMonthlyRevenue(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo tháng' });
    }
  },
  async getDailyRevenue(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getDailyRevenue(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo ngày' });
    }
  },
  async getSumOrderDaily(req, res){
    const { storeId } = req.params;
    const sumOrder = await orderService.getSumOrderDaily(storeId);
    res.json(sumOrder)
  },
  async getSumOrderWeek(req, res){
    const { storeId } = req.params;
    const sumOrder = await orderService.getSumOrderWeek(storeId);
    res.json(sumOrder)
  },
  async getSumOrderMonth(req, res){
    const { storeId } = req.params;
    const sumOrder = await orderService.getSumOrderMonth(storeId);
    res.json(sumOrder)
  },
  async getTop5Product(req, res){
    const { storeId } = req.params;
    const sumOrder = await orderService.getTop5Product(storeId);
    res.json(sumOrder)
  },
  async getStoreRevenue(req, res) {
    const { storeId } = req.params;

    try {
        // Kiểm tra storeId có được gửi hay không
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }

        // Lấy thông tin cửa hàng từ database
        const store = await Store.findById(storeId).select('balance');
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Trả về thông tin doanh thu (balance) của cửa hàng
        return res.status(200).json({
            storeId: storeId,
            balance: store.balance, // Doanh thu thực tế của cửa hàng
        });
    } catch (error) {
        console.error('Error fetching store revenue:', error);
        res.status(500).json({ message: 'Server error' });
    }
}
,
async getStoreRevenueEx (req, res){
    const { storeId } = req.params;

    try {
        // Kiểm tra storeId có được gửi hay không
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }

        // Lấy danh sách các đơn hàng có trạng thái "Hoàn thành" của cửa hàng
        const orders = await Order.find({
            storeId: storeId,
            status: 'Hoàn thành'
        }).select('totalPrice totalShip _id'); // Chỉ lấy các trường cần thiết

        // Tính toán thông tin doanh thu
        const revenueData = orders.map(order => ({
            orderId: order._id, // Mã đơn hàng
            totalOrder: order.totalPrice + order.totalShip, // Tổng tiền đơn hàng (gồm tiền ship)
            orderValue: order.totalPrice, // Giá trị đơn hàng (chỉ tiền đơn)
            storeRevenue: Math.round(order.totalPrice * 0.65) // Doanh thu thực (65% totalPrice)
        }));

        return res.status(200).json(revenueData); // Trả về danh sách doanh thu
    } catch (error) {
        console.error('Error fetching store revenue:', error);
        res.status(500).json({ message: 'Server error' });
    }
},
async getOrderStatusCounts(req, res){
    const sumOrder = await orderService.getOrderStatusCounts();
    res.json(sumOrder)
  },
async getAllObject(req, res){
    const obj = await orderService.getAllObject()
    const rv = await orderService.getRevenueSystem()
    res.status(200).json({ message: 'Get successfully' ,data: {obj,rv}})
},
async getRevenueSystem(req, res){
    const rv = await orderService.getRevenueSystem()
    res.status(200).json(rv)
},
  async getWeeklySystemRevenueOfDelivery(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getWeeklySystemRevenueOfDelivery(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo tuần' });
    }
  },
  async getMonthlySystemRevenueOfDelivery(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getMonthlySystemRevenueOfDelivery(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo tháng' });
    }
  },
  async getDailySystemRevenueOfDelivery(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getDailySystemRevenueOfDelivery(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo ngày' });
    }
  },
  async getWeeklySystemRevenueOfOrder(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getWeeklySystemRevenueOfOrder(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo tuần' });
    }
  },
  async getMonthlySystemRevenueOfOrder(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getMonthlySystemRevenueOfOrder(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo tháng' });
    }
  },
  async getDailySystemRevenueOfOrder(req, res) {
    try {
      const { storeId } = req.params;  // Lấy storeId từ req.params
      const revenue = await orderService.getDailySystemRevenueOfOrder(storeId);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: 'Lỗi khi lấy doanh thu theo ngày' });
    }
  },
  async getTopStatistics (req, res){
    try {
      const topCustomers = await orderService.getTopCustomers();
      const topStores = await orderService.getTopStores();
      const topDrivers = await orderService.getTopDrivers();
  
      res.status(200).json({
        topCustomers,
        topStores,
        topDrivers,
      });
    } catch (error) {
      console.error("Error fetching top statistics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  
};
