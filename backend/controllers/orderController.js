const Order = require("../models/Order");
const wa = require("../services/whatsappService");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/orders?status=&fulfillmentType=&search=&from=&to=&page=&limit=
const getOrders = asyncHandler(async (req, res) => {
  const { status, fulfillmentType, search, from, to, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (fulfillmentType) filter.fulfillmentType = fulfillmentType;
  if (search) {
    filter.$or = [
      { orderId: new RegExp(search, "i") },
      { customerName: new RegExp(search, "i") },
      { customerPhone: new RegExp(search, "i") },
    ];
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: orders.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: orders,
  });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.id }).populate("customer");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, data: order });
});

// PATCH /api/orders/:id/status  { status: 'confirmed' }
// Updates order status and sends a WhatsApp notification to the customer
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "out_for_delivery",
    "completed",
    "cancelled",
  ];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });

  order.status = status;
  order.statusHistory.push({ status, changedBy: req.user?.name || "admin" });
  await order.save();

  try {
    await wa.sendStatusUpdate(order.customerPhone, order);
  } catch (e) {
    // Non-fatal: order status still updates even if WhatsApp send fails
  }

  res.json({ success: true, data: order });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  order.paymentStatus = paymentStatus;
  await order.save();
  res.json({ success: true, data: order });
});

module.exports = { getOrders, getOrder, updateOrderStatus, updatePaymentStatus };
