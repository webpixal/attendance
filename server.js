require('dotenv').config();
const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const socketConfig = require('./config/socket');
const routes = require('./routes');
const zktService = require('./services/zktService');
const syncService = require('./services/syncService');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Socket.IO setup
const io = socketConfig(server);
zktService.setSocketIO(io);

// Initialize services
const initServices = async () => {
  try {
    await zktService.initDevices();
    syncService.init();
    logger.info('ZKTeco services initialized');
  } catch (err) {
    logger.error(`Service initialization failed: ${err.message}`);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  initServices();
});