const http = require('http');
const socketIo = require('socket.io');

let io;

const init = (app) => {
    const server = http.createServer(app);
    io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A driver connected');

        socket.on('disconnect', () => {
            console.log('Driver disconnected');
        });
    });

    return server;
};

const getIo = () => {
    if (!io) {
        throw new Error('Socket.io is not initialized');
    }
    return io;
};

module.exports = { init, getIo };
