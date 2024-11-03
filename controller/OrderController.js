const orderService = require('../services/OrderService');


const paymentService = require('../services/paymentservice')

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
    completeOrder
};
