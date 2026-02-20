const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  // Store connected users
  const connectedUsers = new Map();
  
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });
  
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user._id}`);
    
    // Store user connection
    connectedUsers.set(socket.user._id.toString(), socket.id);
    
    // Join user to their room
    socket.join(`user:${socket.user._id}`);
    
    // Join role-based room
    socket.join(`role:${socket.user.role}`);
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user._id}`);
      connectedUsers.delete(socket.user._id.toString());
    });
    
    // Handle task updates via socket
    socket.on('task:move', async (data) => {
      try {
        const { taskId, newStatus } = data;
        
        // Emit to all relevant users
        io.emit('task:moved', {
          taskId,
          newStatus,
          updatedBy: socket.user._id
        });
      } catch (error) {
        console.error('Socket error:', error);
      }
    });
  });
  
  // Make io accessible in routes
  return io;
};