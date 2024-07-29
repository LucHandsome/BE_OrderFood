const userRouter = require('./UserRouter');
const storeRouter = require('./StoreRouter');
const Product = require('./Product');
const toppingGroup = require('./toppingGroup');
const toppingRouter = require('./toppingRouter')
const customerRouter = require('./CustomerRouter')
const driverRouter = require('./driverRouter')
const orderRouter = require('./OrderRouter')
const auth = require('../middleware/auth');

module.exports = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/store', storeRouter);
    app.use('/api/product', Product);
    app.use('/api/toppingGroup', toppingGroup);
    app.use('/api/topping', toppingRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/driver', driverRouter);
    app.use('/api/order', orderRouter);

};
