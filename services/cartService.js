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

        // Tìm giỏ hàng hiện tại của người dùng cho cửa hàng cụ thể
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
            // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng
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


const getCartByUserId = async (userId, storeId) => {
    try {
        const cart = await Cart.findOne({ userId, storeId }).populate('items.productId');
        
        if (!cart) {
            throw new Error('Giỏ hàng trống.');
        }
        
        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
};


// Hàm cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItemQuantity = async (userId, storeId, productId, newQuantity) => {
    try {
        // Tìm giỏ hàng của người dùng cho cửa hàng cụ thể
        const cart = await Cart.findOne({ userId, storeId });

        if (!cart) {
            throw new Error('Giỏ hàng không tồn tại.');
        }

        // Tìm sản phẩm trong giỏ hàng
        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            throw new Error('Sản phẩm không tồn tại trong giỏ hàng.');
        }

        // Cập nhật số lượng mới
        item.quantity = newQuantity;
        item.totalPrice = item.quantity * item.price;

        // Cập nhật tổng số lượng và tổng giá trị giỏ hàng
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        await cart.save();
        return cart;
    } catch (error) {
        throw new Error(error.message);
    }
};



// Hàm xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (userId, storeId, productId) => {
    try {
        const cart = await Cart.findOne({ userId, storeId });

        if (!cart) {
            throw new Error('Giỏ hàng không tồn tại.');
        }

        const initialLength = cart.items.length;

        // Lọc các mục giỏ hàng để xóa sản phẩm với productId cho cửa hàng
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        // Kiểm tra xem sản phẩm có được tìm thấy và xóa không
        if (cart.items.length === initialLength) {
            throw new Error('Sản phẩm không tồn tại trong giỏ hàng.');
        }

        // Cập nhật tổng số lượng và tổng giá trị giỏ hàng
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        await cart.save();
        return cart; // Có thể trả về cart.items nếu đó là phản hồi mong muốn
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
