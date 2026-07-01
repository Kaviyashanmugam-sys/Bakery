const WhatsAppLog = require("../models/WhatsAppLog");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/whatsapp-logs?phone=&direction=&page=&limit=
const getLogs = asyncHandler(async (req, res) => {
  const { phone, direction, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (phone) filter.phone = phone;
  if (direction) filter.direction = direction;

  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    WhatsAppLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    WhatsAppLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    count: logs.length,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / Number(limit)),
    data: logs,
  });
});

module.exports = { getLogs };
