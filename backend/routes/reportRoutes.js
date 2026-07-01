const express = require("express");
const router = express.Router();
const { exportOrdersExcel, exportOrdersPDF } = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

router.get("/orders/excel", protect, exportOrdersExcel);
router.get("/orders/pdf", protect, exportOrdersPDF);

module.exports = router;
