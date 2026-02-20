// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');
// const cookieParser = require('cookie-parser');
// const dotenv = require('dotenv');
// const http = require('http');
// const socketIo = require('socket.io');

// dotenv.config();

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//     credentials: true
//   }
// });

// // Make io accessible in routes
// app.set('io', io);

// // Middleware
// app.use(helmet({
//   crossOriginResourcePolicy: false,
// }));
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
//   credentials: true
// }));
// app.use(express.json());
// app.use(cookieParser());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use('/api', limiter);

// // MongoDB Connection with correct options (removed deprecated options)
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ MongoDB Connected Successfully');
//   } catch (err) {
//     console.error('❌ MongoDB connection error:', err.message);
//     // Don't exit process, just log error
//     console.log('⚠️  Continuing without database - some features may not work');
//   }
// };

// connectDB();

// // Handle MongoDB connection events
// mongoose.connection.on('connected', () => {
//   console.log('✅ Mongoose connected to DB');
// });

// mongoose.connection.on('error', (err) => {
//   console.error('❌ Mongoose connection error:', err);
// });

// mongoose.connection.on('disconnected', () => {
//   console.log('⚠️  Mongoose disconnected');
// });

// // Routes
// try {
//   app.use('/api/auth', require('./routes/auth.routes'));
//   app.use('/api/users', require('./routes/user.routes'));
//   app.use('/api/tasks', require('./routes/task.routes'));
// } catch (err) {
//   console.error('Route loading error:', err.message);
// }

// // Health check route
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     status: 'OK', 
//     mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
//     readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//     timestamp: new Date().toISOString()
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Server error:', err.stack);
//   res.status(err.status || 500).json({
//     message: err.message || 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? err : {}
//   });
// });

// // Socket.io
// try {
//   require('./socket')(io);
// } catch (err) {
//   console.error('Socket initialization error:', err.message);
// }

// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
// });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const dns = require('dns'); // Add this line

// Force Node.js to use Google DNS (fix for DNS resolution issues)
dns.setServers(['8.8.8.8', '8.8.4.4']);
console.log('🔧 DNS configured with servers:', dns.getServers());

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Make io accessible in routes
app.set('io', io);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// MongoDB Connection with DNS fix
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Log connection info
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`📚 Available collections: ${collections.map(c => c.name).join(', ') || 'none'}`);
    
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Continuing without database - some features may not work');
  }
};

connectDB();

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
});

// Routes
try {
  app.use('/api/auth', require('./routes/auth.routes'));
  app.use('/api/users', require('./routes/user.routes'));
  app.use('/api/tasks', require('./routes/task.routes'));
} catch (err) {
  console.error('Route loading error:', err.message);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    dnsServers: dns.getServers(),
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Socket.io
try {
  require('./socket')(io);
} catch (err) {
  console.error('Socket initialization error:', err.message);
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});