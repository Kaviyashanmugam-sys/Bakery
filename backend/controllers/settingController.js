const Setting = require("../models/Setting");
const { asyncHandler } = require("../middleware/errorHandler");

// GET /api/settings — returns the single settings document, creating a
// default one on first run
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Setting.findOne({ singletonKey: "app_settings" });
  if (!settings) {
    settings = await Setting.create({ singletonKey: "app_settings" });
  }
  res.json({ success: true, data: settings });
});

// PUT /api/settings — partial update, used by all three settings-related pages
// (General Settings, Meta Configuration, Flow Builder Configuration)
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOneAndUpdate(
    { singletonKey: "app_settings" },
    { $set: req.body },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: settings });
});

module.exports = { getSettings, updateSettings };
