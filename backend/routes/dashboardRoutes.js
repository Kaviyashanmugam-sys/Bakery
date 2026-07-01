const express = require("express");
const router = express.Router();
const { getSummary, getSalesTrend } = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");

router.get("/summary", protect, getSummary);
router.get("/sales-trend", protect, getSalesTrend);

module.exports = router;
