const express = require("express");
const router = express.Router();
const { getLogs } = require("../controllers/whatsappLogController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getLogs);

module.exports = router;
