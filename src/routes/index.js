const userRouter = require('./UserRouter');
const storeRouter = require('./StoreRouter');
const Product = require('./Product')

module.exports = (app) => {
    app.use('/api/user', userRouter);
    app.use('/api/store', storeRouter);
    app.use('/api/product', Product);
};
