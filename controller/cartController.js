const cartService = require('../services/cartService');

// Controller thêm sản phẩm vào giỏ hàng
const addProductToCart = async (req, res) => {
    try {
        const { productId, storeId, quantity, userId } = req.body;
        console.log(productId, storeId, quantity, userId)
        if (!productId || !storeId || !quantity) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm, cửa hàng và số lượng.' });
        }

        const cart = await cartService.addToCart(userId, storeId, productId, quantity);

        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Controller để lấy dữ liệu giỏ hàng của người dùng
const getCart = async (req, res) => {
    try {
        const userId = req.query.userId; // Read userId from query parameters

        const cart = await cartService.getCartByUserId(userId);

        return res.status(200).json(cart);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Update the quantity of a product in the cart
const updateCartQuantity = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body; // Chỉnh sửa từ newQuantity thành quantity
        console.log( "user:"+userId+", pro: "+ productId+", soluong:"+quantity)
        // Input validation
        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
        }

        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative.' });
        }

        const updatedCart = await cartService.updateCartItemQuantity(userId, productId, quantity);

        return res.status(200).json(updatedCart); // Return the updated cart
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return res.status(500).json({ message: 'An error occurred while updating the cart quantity.', error: error.message });
    }
};



const removeCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'userId and productId are required.' });
        }

        const updatedCart = await cartService.removeCartItem(userId, productId);

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
};


module.exports = {
    addProductToCart,
    getCart,
    updateCartQuantity,
    removeCartItem
};
