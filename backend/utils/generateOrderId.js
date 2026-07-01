const Order = require("../models/Order");

// Generates a unique, human-readable order ID like BAK-20260701-0007
// Format: BAK-YYYYMMDD-<daily sequence, zero padded>
async function generateOrderId() {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, ""); // 20260701

  const startOfDay = new Date(now.setHours(0, 0, 0, 0));
  const endOfDay = new Date(now.setHours(23, 59, 59, 999));

  const countToday = await Order.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  const sequence = String(countToday + 1).padStart(4, "0");
  return `BAK-${datePart}-${sequence}`;
}

module.exports = generateOrderId;
