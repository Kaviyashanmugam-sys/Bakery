const Order = require("../models/Order");
const Customer = require("../models/Customer");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/dashboard/summary
const getSummary = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const [
    totalOrders,
    todaysOrders,
    pendingOrders,
    completedOrders,
    cancelledOrders,
    totalCustomers,
    revenueAgg,
    todaysRevenueAgg,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
    Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing", "ready", "out_for_delivery"] } }),
    Order.countDocuments({ status: "completed" }),
    Order.countDocuments({ status: "cancelled" }),
    Customer.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalOrders,
      todaysOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalCustomers,
      totalRevenue: revenueAgg[0]?.total || 0,
      todaysRevenue: todaysRevenueAgg[0]?.total || 0,
    },
  });
});

// GET /api/dashboard/sales-trend?days=7
const getSalesTrend = asyncHandler(async (req, res) => {
  const days = Number(req.query.days || 7);
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const trend = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({ success: true, data: trend });
});

module.exports = { getSummary, getSalesTrend };
