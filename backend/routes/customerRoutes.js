const express = require("express");
const router = express.Router();
const {
  getCustomers,
  getCustomer,
  updateCustomer,
  toggleBlockCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomer);
router.put("/:id", protect, updateCustomer);
router.patch("/:id/toggle-block", protect, toggleBlockCustomer);

module.exports = router;
