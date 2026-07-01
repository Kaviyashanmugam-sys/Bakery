const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const generateOrderId = require("../utils/generateOrderId");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/public/categories — active categories only, no auth (used by any
// future web storefront, or for manually testing without a JWT)
const getPublicCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
  res.json({ success: true, data: categories });
});

// GET /api/public/products?category=
const getPublicProducts = asyncHandler(async (req, res) => {
  const filter = { isAvailable: true };
  if (req.query.category) filter.category = req.query.category;
  const products = await Product.find(filter).populate("category", "name emoji");
  res.json({ success: true, data: products });
});

// GET /api/public/order-status/:orderId — customer-facing status check
const getPublicOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.orderId }).select(
    "orderId status totalAmount createdAt preferredDate preferredTime fulfillmentType"
  );
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  res.json({ success: true, data: order });
});

// POST /api/public/orders — create an order directly (e.g. from a future web storefront,
// or for testing the order pipeline without going through WhatsApp)
const createPublicOrder = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, items, fulfillmentType, deliveryAddress, preferredDate, preferredTime, paymentMethod } = req.body;

  if (!customerName || !customerPhone || !items?.length) {
    return res.status(400).json({ success: false, message: "customerName, customerPhone, and items are required" });
  }

  let customer = await Customer.findOne({ phone: customerPhone });
  if (!customer) customer = await Customer.create({ name: customerName, phone: customerPhone });

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gstPercentage = Number(process.env.GST_PERCENTAGE || 0);
  const gstAmount = gstPercentage ? Math.round((itemsTotal * gstPercentage) / 100) : 0;

  const orderId = await generateOrderId();
  const order = await Order.create({
    orderId,
    customer: customer._id,
    customerName,
    customerPhone,
    items: items.map((i) => ({ ...i, subtotal: i.price * i.quantity })),
    itemsTotal,
    gstPercentage,
    gstAmount,
    totalAmount: itemsTotal + gstAmount,
    fulfillmentType,
    deliveryAddress,
    preferredDate,
    preferredTime,
    paymentMethod,
    status: "pending",
    statusHistory: [{ status: "pending", changedBy: "public_api" }],
  });

  customer.totalOrders += 1;
  customer.totalSpent += order.totalAmount;
  customer.lastOrderAt = new Date();
  await customer.save();

  res.status(201).json({ success: true, data: order });
});

module.exports = { getPublicCategories, getPublicProducts, getPublicOrderStatus, createPublicOrder };
