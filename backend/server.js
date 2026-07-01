require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Route imports
const webhookRoutes = require("./routes/webhookRoutes");
const flowRoutes = require("./routes/flowRoutes");
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");
const whatsappLogRoutes = require("./routes/whatsappLogRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingRoutes = require("./routes/settingRoutes");
const templateRoutes = require("./routes/templateRoutes");
const publicRoutes = require("./routes/publicRoutes");

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" })); // Meta sends JSON webhook payloads
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan("dev", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

// --- Health check ---
app.get("/", (req, res) => {
  res.json({ success: true, message: "WhatsApp Bakery Bot API is running" });
});

// --- Routes ---
app.use("/webhook", webhookRoutes); // WhatsApp Cloud API webhook (public)
app.use("/api/flow-endpoint", flowRoutes); // Meta WhatsApp Flow data endpoint (public, encrypted)
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/whatsapp-logs", whatsappLogRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/public", publicRoutes); // unauthenticated: categories, products, orders, order-status

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  });
});

// Guard against unhandled promise rejections crashing the process silently
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
});

module.exports = app;
