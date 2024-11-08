const Cart = require('../models/Cart');
const Product = require('../models/product');
const Store = require('../models/Store');
const Topping = require('../models/topping')

// Thêm sản phẩm vào giỏ hàng
const addToCart = async (userId, storeId, productId, quantity) => {
    try {
        const product = await Product.findById(productId);
        const store = await Store.findById(storeId);
        const topping = await Topping.findById(storeId);
        
        if (!product || !store || !topping) {
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
                totalPrice: product.Price * quantity,
                storeId: store._id 
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
// const addToCart = async (userId, storeId, productId, quantity, toppings) => {
//     try {
//         const product = productId ? await Product.findById(productId) : null;
//         const store = await Store.findById(storeId);

//         if (!store) {
//             throw new Error('Cửa hàng không tồn tại.');
//         }

//         // Tìm giỏ hàng hiện tại của người dùng cho cửa hàng cụ thể
//         let cart = await Cart.findOne({ userId, storeId });

//         // Nếu chưa có giỏ hàng, tạo mới
//         if (!cart) {
//             cart = new Cart({
//                 userId,
//                 storeId,
//                 storeName: store.storeName,
//                 storeAddress: store.storeAddress,
//                 items: [],
//                 totalItems: 0,
//                 totalPrice: 0,
//             });
//         }

//         // Kiểm tra nếu productId tồn tại thì thêm sản phẩm vào giỏ hàng
//         if (product) {
//             const cartItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
//             if (cartItemIndex > -1) {
//                 cart.items[cartItemIndex].quantity += quantity;
//                 cart.items[cartItemIndex].totalPrice = cart.items[cartItemIndex].quantity * product.Price;
//             } else {
//                 cart.items.push({
//                     productId: product._id,
//                     name: product.Food_name || "Unknown product",
//                     description: product.Food_detail || "",
//                     price: product.Price || 0,
//                     quantity: quantity,
//                     imageUrl: product.Food_picture || "",
//                     totalPrice: (product.Price || 0) * quantity,
//                     storeId: store._id
//                 });
//             }
//         }

//         // Thêm topping vào giỏ hàng nếu có toppings
//         toppings.forEach(async (toppingId) => {
//             const topping = await Topping.findById(toppingId);
//             if (topping) {
//                 cart.items.push({
//                     productId: topping._id,
//                     name: topping.name || "Unknown topping",
//                     price: topping.price || 0,
//                     quantity: 1,  // giả sử mỗi topping chỉ có số lượng là 1
//                     imageUrl: topping.imageUrl || "",
//                     totalPrice: topping.price || 0,
//                     storeId: store._id
//                 });
//             }
//         });

//         // Cập nhật tổng số lượng và tổng giá trị giỏ hàng
//         cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
//         cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

//         // Lưu lại giỏ hàng
//         await cart.save();

//         return cart;
//     } catch (error) {
//         throw new Error(error.message);
//     }
// };




const getCartByUserId = async (userId) => {
    try {
        // Chỉ tìm kiếm giỏ hàng dựa trên userId, không cần storeId
        const cart = await Cart.find({ userId }).populate('items.productId');

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
        // Tìm giỏ hàng của người dùng theo storeId
        const cart = await Cart.findOne({ userId, storeId });

        if (!cart) {
            throw new Error('Giỏ hàng không tồn tại cho cửa hàng này.');
        }

        // Tìm sản phẩm trong giỏ hàng của cửa hàng
        const item = cart.items.find(item => item.productId.toString() === productId);

        if (!item) {
            throw new Error('Sản phẩm không tồn tại trong giỏ hàng của cửa hàng này.');
        }

        // Cập nhật số lượng và tổng giá mới cho sản phẩm
        item.quantity = newQuantity;
        item.totalPrice = item.quantity * item.price;

        // Cập nhật tổng số lượng và tổng giá trị cho giỏ hàng của cửa hàng
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
        const cart = await Cart.findOne({ userId, storeId});
        console.log(userId, storeId, productId)
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

// Hàm xóa sản phẩm khỏi giỏ hàng theo danh sách productId
const removeCartItems = async (userId, storeId, productIds) => {
    try {
        const cart = await Cart.findOne({ userId, storeId });

        if (!cart) {
            throw new Error('Giỏ hàng không tồn tại.');
        }

        const initialLength = cart.items.length;

        // Lọc các mục giỏ hàng để xóa sản phẩm theo productId
        cart.items = cart.items.filter(item => !productIds.includes(item.productId.toString()));

        // Kiểm tra xem sản phẩm có được tìm thấy và xóa không
        if (cart.items.length === initialLength) {
            throw new Error('Không có sản phẩm nào được xóa.');
        }

        // Cập nhật tổng số lượng và tổng giá trị giỏ hàng
        cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        cart.totalPrice = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);

        await cart.save();
        return cart; // Có thể trả về giỏ hàng đã cập nhật
    } catch (error) {
        throw new Error(error.message);
    }
};



module.exports = {
    addToCart,
    getCartByUserId,
    updateCartItemQuantity,
    removeCartItem,
    removeCartItems
};
