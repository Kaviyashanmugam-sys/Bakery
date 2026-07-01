const { templates } = require("../services/templateService");
const TemplateLog = require("../models/TemplateLog");
const { asyncHandler } = require("../middleware/errorHandler");

// POST /api/templates/send  { templateKey, to, params, relatedOrderId }
// Lets an admin manually fire any of the 9 templates from the dashboard (useful
// for testing a newly-approved template before wiring it into automatic flows).
const sendTemplateManually = asyncHandler(async (req, res) => {
  const { templateKey, to, params = {}, relatedOrderId } = req.body;
  const fn = templates[templateKey];
  if (!fn) {
    return res.status(400).json({ success: false, message: `Unknown templateKey: ${templateKey}` });
  }
  const result = await fn(to, params, relatedOrderId);
  res.json({ success: true, data: result });
});

// GET /api/templates/logs
const getTemplateLogs = asyncHandler(async (req, res) => {
  const { templateName, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (templateName) filter.templateName = templateName;
  const skip = (Number(page) - 1) * Number(limit);
  const [logs, total] = await Promise.all([
    TemplateLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    TemplateLog.countDocuments(filter),
  ]);
  res.json({ success: true, count: logs.length, total, data: logs });
});

module.exports = { sendTemplateManually, getTemplateLogs };
