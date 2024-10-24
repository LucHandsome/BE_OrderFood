// paymentController.js

const paymentService = require('../services/paymentservice');

const handlePaymentStatus = async (req, res) => {
    const { orderID, status } = req.body;
    console.log(orderID,status)
    try {
    
        const result = await paymentService.updateOrderStatus(orderID);
        if(result){
            return res.status(200).json({
                status: 'OK',
                message: 'Order status updated successfully'})
        }
    } catch (error) {
        console.log(error)
        return res.status(499).json({
            status: 'ERR',
            message: error
        });
    }
};

const createPaymentTransaction = async (req, res) => {
    const { amount, currency, message, userID, orderID, return_url } = req.body;

    const private_key = 'pk_presspay_d93fe99984de8e2f433a0ef88b7a2cdad8eb95c00756270b3170fc0ee3d7dc81'; // Thay đổi key nếu cần

    if (!amount || !currency || !message || !userID || !orderID || !return_url) {
        return res.status(400).json({
            status: 'ERR',
            message: 'All fields are required'
        });
    }

    try {
        const response = await paymentService.initiatePayment(private_key, amount, currency, message, userID, orderID, return_url);

        if (response.data.url) {
            res.status(200).json({
                status: 'OK',
                message: 'Redirect to url',
                data: {
                    url: response.data.url
                }
            });
        } else {
            res.status(400).json({
                status: 'ERR',
                message: 'Failed to create payment transaction'
            });
        }
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message
        });
    }
};

module.exports = {
    handlePaymentStatus,
    createPaymentTransaction
};