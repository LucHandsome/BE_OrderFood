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

const getOrderById = async (req, res) => {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({
            status: 'ERR',
            message: 'Order ID is required'
        });
    }

    try {
        const order = await orderService.getOrderById(id);

        if (order) {
            return res.status(200).json({
                status: 'OK',
                data: order
            });
        } else {
            return res.status(404).json({
                status: 'ERR',
                message: 'Order not found'
            });
        }
    } catch (error) {
        return res.status(500).json({
            status: 'ERR',
            message: error.message
        });
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
    getOrderById
};
