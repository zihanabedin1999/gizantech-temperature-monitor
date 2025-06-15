require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Apply CORS to Express
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  pingTimeout: 10000,
  pingInterval: 25000
});

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 100, // limit each IP to 100 requests per windowMs
  message: { 
    status: 429,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// In production, serve static files from the React app
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
}

// Apply rate limiter to all /api/* endpoints
app.use('/api', apiLimiter);

// API Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to GizanTech Temperature Monitor API',
    status: 'operational',
    endpoints: {
      health: 'GET /api/health',
      websocket: `ws://localhost:${process.env.PORT || 5000}/socket.io/`
    },
    frontend: `http://localhost:${process.env.NODE_ENV === 'production' ? (process.env.PORT || 5000) : 3000}`
  });
});

// In development, let the frontend dev server handle all routes
if (process.env.NODE_ENV !== 'production') {
  app.get('*', (req, res) => {
    res.redirect(`http://localhost:3000${req.path}`);
  });
} else {
  // In production, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
  });
}

// Health check endpoint (not rate-limited)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Temperature endpoint with rate limiting
app.get('/temperature', apiLimiter, (req, res) => {
  try {
    const temperatureData = generateTemperatureData();
    // Emit the new data to all connected clients
    io.emit('temperatureUpdate', temperatureData);
    res.json(temperatureData);
  } catch (error) {
    logger.error('Error in /temperature endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Generate random temperature data
function generateTemperatureData() {
  const minTemp = 15;
  const maxTemp = 45;
  const temperature = (Math.random() * (maxTemp - minTemp) + minTemp).toFixed(2);
  
  return {
    temperature: parseFloat(temperature),
    unit: 'Celsius',
    timestamp: new Date().toISOString()
  };
}

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info('New client connected');
  
  // Send initial data
  const initialData = generateTemperatureData();
  socket.emit('temperatureUpdate', initialData);
  
  // Set up interval to send temperature updates every 5 seconds
  const interval = setInterval(() => {
    const data = generateTemperatureData();
    socket.emit('temperatureUpdate', data);
  }, 5000);
  
  socket.on('disconnect', () => {
    logger.info('Client disconnected');
    clearInterval(interval);
  });
  
  socket.on('error', (error) => {
    logger.error('Socket error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server, generateTemperatureData };
