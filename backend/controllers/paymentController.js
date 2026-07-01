const Payment = require("../models/Payment");
const Order = require("../models/Order");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/payments  { orderId, amount, method, status, transactionRef }
// Records a payment against an order. Used by the admin dashboard to log cash/UPI/card
// payments manually, or could be called from a payment gateway webhook in the future.
const createPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, method, status = "pending", transactionRef } = req.body;

  const order = await Order.findOne({ orderId });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  const payment = await Payment.create({
    order: order._id,
    orderId,
    amount,
    method,
    status,
    transactionRef,
    paidAt: status === "paid" ? new Date() : undefined,
  });

  if (status === "paid") {
    order.paymentStatus = "paid";
    await order.save();
  }

  res.status(201).json({ success: true, data: payment });
});

// GET /api/payments?orderId=
const getPayments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.orderId) filter.orderId = req.query.orderId;
  const payments = await Payment.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: payments.length, data: payments });
});

module.exports = { createPayment, getPayments };
