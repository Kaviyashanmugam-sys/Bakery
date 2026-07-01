const express = require("express");
const router = express.Router();
const { sendTemplateManually, getTemplateLogs } = require("../controllers/templateController");
const { protect } = require("../middleware/auth");

router.post("/send", protect, sendTemplateManually);
router.get("/logs", protect, getTemplateLogs);

module.exports = router;
