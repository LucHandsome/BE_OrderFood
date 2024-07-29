const orderService = require('../services/OrderService');


const createOrder = async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the incoming request body
        if (!req.body.paymentStatus) {
            req.body.paymentStatus = 'Chưa thanh toán';
        }
        const order = await orderService.createOrder(req.body);
        // Do not assign a driver automatically here
        res.status(201).json({ status: 'OK', data: order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ status: 'ERROR', message: error.message });
    }
};

const getPendingOrders = async (req, res) => {
    try {
        const pendingOrders = await orderService.getPendingOrders();
        res.status(200).json({ status: 'OK', data: pendingOrders });
    } catch (error) {
        console.error('Error fetching pending orders:', error);
        res.status(500).json({ status: 'ERROR', message: error.message });
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
module.exports = {
    createOrder,
    getPendingOrders,
    updateOrder,
    getOrdersByDriverAndStatus,
    getOrdersByDriverAndStatus2,
    getOrdersByStoreAndStatus,
    getOrdersByStoreAndStatus2,
    handlePressPayCallback
};
