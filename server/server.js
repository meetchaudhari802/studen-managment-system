/**
 * Express Server Entry Point (server/server.js)
 * PBL Micro Project: Student Management System
 * Supports API routing, static frontend single-service serving in production,
 * centralized error handling, and test environment isolation.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management System API is running healthy',
    timestamp: new Date().toISOString()
  });
});

// Ensure DB is connected for API requests (vital for Vercel serverless cold starts)
app.use(async (req, res, next) => {
  if (req.originalUrl.startsWith('/api') && req.originalUrl !== '/api/health') {
    try {
      await connectDB();
    } catch (err) {
      console.error('[DB Middleware Error]:', err.message);
    }
  }
  next();
});

// Mount API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve frontend static build in production (single-service deployment)
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
  const clientDistPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Connect DB and listen only if not in testing mode and not on Vercel
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  connectDB();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Server] Express server running on port ${PORT}`);
  });
}

module.exports = app;
