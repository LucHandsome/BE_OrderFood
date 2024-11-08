const cartService = require('../services/cartService');

// Controller to add a product to the cart
const addProductToCart = async (req, res) => {
    try {
        const { productId, storeId, quantity, userId } = req.body;
        console.log(productId, storeId, quantity, userId);

        // Validate input
        if (!productId || !storeId || !quantity || !userId) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin sản phẩm, cửa hàng, số lượng và người dùng.' });
        }

        const cart = await cartService.addToCart(userId, storeId, productId, quantity);

        return res.status(200).json(cart);
    } catch (error) {
        console.error('Error adding product to cart:', error.message);
        return res.status(500).json({ message: error.message });
    }
};
// const addProductToCart = async (req, res) => {
//     try {
//         const { productId, storeId, quantity = 1, userId, toppings = [] } = req.body; // Đảm bảo toppings là một mảng mặc định
//         console.log(productId, storeId, quantity, userId, toppings);

//         // Validate input
//         if (!storeId || !userId) {
//             return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin cửa hàng và người dùng.' });
//         }

//         // Nếu không có productId và toppings rỗng, báo lỗi
//         if (!productId && toppings.length === 0) {
//             return res.status(400).json({ message: 'Vui lòng chọn sản phẩm hoặc topping.' });
//         }

//         // Gọi hàm addToCart với cả productId và toppings
//         const cart = await cartService.addToCart(userId, storeId, productId, quantity, toppings);

//         return res.status(200).json(cart);
//     } catch (error) {
//         console.error('Error adding product or toppings to cart:', error.message);
//         return res.status(500).json({ message: error.message });
//     }
// };


 
// Controller to get the user's cart data
const getCart = async (req, res) => {
    try {
        const userId = req.query.userId; // Read userId from query parameters

        if (!userId) {
            return res.status(400).json({ message: 'userId is required.' });
        }

        const cart = await cartService.getCartByUserId(userId);

        return res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Controller to update the quantity of a product in the cart
const updateCartQuantity = async (req, res) => {
    try {
        const { userId, storeId, productId, quantity } = req.body; // Adjusted from newQuantity to quantity
        console.log("user:" + userId + ", pro: " + productId + ", soluong:" + quantity);

        // Input validation
        if (!userId || !productId || quantity === undefined) {
            return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
        }

        if (quantity < 0) {
            return res.status(400).json({ message: 'Quantity cannot be negative.' });
        }

        const updatedCart = await cartService.updateCartItemQuantity(userId, storeId, productId, quantity);

        return res.status(200).json(updatedCart); // Return the updated cart
    } catch (error) {
        console.error('Error updating cart quantity:', error.message);
        return res.status(500).json({ message: 'An error occurred while updating the cart quantity.', error: error.message });
    }
};

// Controller to remove a product from the cart
const removeCartItem = async (req, res) => {
    try {
        const { userId, storeId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'userId and productId are required.' });
        }

        const updatedCart = await cartService.removeCartItem(userId, storeId, productId);

        return res.status(200).json(updatedCart);
    } catch (error) {
        console.error('Error removing cart item:', error.message);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addProductToCart,
    getCart,
    updateCartQuantity,
    removeCartItem
};
