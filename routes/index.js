const userRouter = require('./UserRouter');
const storeRouter = require('./StoreRouter');
const Product = require('./Product');
const category = require('./categoryRouter');
const toppingRouter = require('./toppingRouter')
const customerRouter = require('./CustomerRouter')
const driverRouter = require('./driverRouter')
const orderRouter = require('./OrderRouter')
const payment = require('./paymentRouter')
const cart = require('./cartRouter')

const auth = require('../middleware/auth');

module.exports = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/store', storeRouter);
    app.use('/api/product', Product);
    app.use('/api/category', category);
    app.use('/api/topping', toppingRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/driver', driverRouter);
    app.use('/api/order', orderRouter);
    app.use('/api/payment',payment);
    app.use('/api/cart',cart);

};
