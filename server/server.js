require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');

// Connect to MongoDB before starting the server
connectDB();

const app = express();

// --- Core middleware ---
app.use(cors()); // permissive default for development; can be tightened later
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    environment: process.env.NODE_ENV,
  });
});

// --- Static frontend ---
// Serves the client folder so pages can be opened without a separate frontend server.
app.use(express.static(path.join(__dirname, '../client')));

// --- Centralized error handler ---
// Kept intentionally simple for Stage 1; will be expanded when controllers exist.
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Server Error'
        : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
