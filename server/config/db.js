const mongoose = require('mongoose');

// Establishes the MongoDB connection using Mongoose.
// Reads the connection string from process.env.MONGODB_URI — never hardcoded.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection failed: ${err.message}`);
    // Exit the process — the app is not usable without a database connection
    process.exit(1);
  }
};

module.exports = connectDB;
