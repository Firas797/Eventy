require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // Add this import
const setupWebSocket = require('./websocket');
const eventRoutes = require('../backend/routes/EventRoutes');
const authRoutes = require('../backend/routes/authRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket
const { sendRealTimeNotification } = setupWebSocket(server);

// Make sendRealTimeNotification available to other modules if needed
app.set('sendRealTimeNotification', sendRealTimeNotification);

// Start the server
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));