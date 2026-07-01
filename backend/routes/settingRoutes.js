const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingController");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", protect, getSettings);
router.put("/", protect, requireRole("superadmin"), updateSettings);

module.exports = router;
