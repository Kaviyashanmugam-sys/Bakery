const express = require("express");
const router = express.Router();
const { handleFlowEndpoint } = require("../controllers/flowController");

// Meta calls this directly (no admin JWT — it's authenticated via the
// encrypted payload + your app's signature, not a bearer token)
router.post("/", handleFlowEndpoint);

module.exports = router;
