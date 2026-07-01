const mongoose = require("mongoose");
const logger = require("../utils/logger");

// Connects to MongoDB Atlas using the URI from .env
// Exits the process if connection fails since the app cannot run without a DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
