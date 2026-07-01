const express = require("express");
const router = express.Router();
const {
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.patch("/:id/status", protect, updateOrderStatus);
router.patch("/:id/payment-status", protect, updatePaymentStatus);

module.exports = router;
