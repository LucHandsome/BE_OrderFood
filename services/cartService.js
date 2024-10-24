const Cart = require('../models/Cart');
const Product = require('../models/product');
const Store = require('../models/Store');

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (userId, storeId, productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        const store = await Store.findById(storeId);

        if (!product || !store) {
            throw new Error('Sản phẩm hoặc cửa hàng không tồn tại.');
        }

        // Tìm giỏ hàng hiện tại của người dùng (và cửa hàng cụ thể)
        let cart = await Cart.findOne({ userId, storeId });

        // Nếu chưa có giỏ hàng, tạo mới
        if (!cart) {
            cart = new Cart({
                userId,
                storeId,
                storeName: store.storeName,
                storeAddress: store.storeAddress,
                items: [],
                totalItems: 0,
                totalPrice: 0
            });
        }

        // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
        const cartItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (cartItemIndex > -1) {
            // Nếu sản phẩm đã có trong giỏ, tăng số lượng
            cart.items[cartItemIndex].quantity += quantity;
            cart.items[cartItemIndex].totalPrice = cart.items[cartItemIndex].quantity * product.Price;
        } else {
            // Nếu chưa có, thêm sản phẩm mới vào giỏ
            cart.items.push({
                productId: product._id,
                name: product.Food_name,
                description: product.Food_detail,
                price: product.Price,
                quantity: quantity,
                imageUrl: product.Food_picture,
                totalPrice: product.Price * quantity
            });
        }

        // Cập nhật tổng số lượng và tổng giá trị giỏ hàng
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        // Lưu lại giỏ hàng
        await cart.save();

        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
};

const getCartByUserId = async (userId) => {
    try {
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        
        if (!cart) {
            throw new Error('Giỏ hàng trống.');
        }
        
        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
};

// Hàm cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItemQuantity = async (userId, productId, newQuantity) => {
    try {
        // Find the user's cart
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new Error('Giỏ hàng không tồn tại.'); // "Cart does not exist."
        }

        // Find the product in the cart
        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            throw new Error('Sản phẩm không tồn tại trong giỏ hàng.'); // "Product does not exist in cart."
        }

        // Update the new quantity
        item.quantity = newQuantity;

        // Update total price
        // Assuming item.price is already stored in the cart item
        item.totalPrice = item.quantity * item.price;

        await cart.save();
        return cart; // Optionally, you could return just the updated item or a success message
    } catch (error) {
        throw new Error(error.message);
    }
};


// Hàm xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (userId, productId) => {
    try {
        const cart = await Cart.findOne({ userId });

        if (!cart) {
            throw new Error('Cart not found for this user.');
        }

        const initialLength = cart.items.length;

        // Filter the cart items to remove the product with the given productId
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        // Check if the product was found and removed
        if (cart.items.length === initialLength) {
            throw new Error('Product not found in cart.');
        }

        await cart.save();
        return cart; // Optionally, return only cart.items if that's the desired response
    } catch (error) {
        throw new Error(error.message);
    }
};



module.exports = {
    addToCart,
    getCartByUserId,
    updateCartItemQuantity,
    removeCartItem
};
