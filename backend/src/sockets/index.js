const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function registerSockets(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next();
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        socket.userId = user._id;
        socket.user = user;
      }
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      next();
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}, userId: ${socket.userId || 'anonymous'}`);

    socket.on('joinAuction', (auctionId) => {
      if (!auctionId) return;
      socket.join(`auction:${auctionId}`);
      console.log(`Socket ${socket.id} joined auction:${auctionId}`);
    });

    socket.on('leaveAuction', (auctionId) => {
      if (!auctionId) return;
      socket.leave(`auction:${auctionId}`);
      console.log(`Socket ${socket.id} left auction:${auctionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}

module.exports = registerSockets;
