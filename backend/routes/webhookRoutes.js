const express = require("express");
const router = express.Router();
const { verifyWebhook, receiveWebhook } = require("../controllers/webhookController");

// Meta calls GET to verify the webhook URL when you first configure it
router.get("/", verifyWebhook);
// Meta calls POST for every inbound message / status event
router.post("/", receiveWebhook);

module.exports = router;
