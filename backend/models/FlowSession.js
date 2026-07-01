const mongoose = require("mongoose");

// Meta WhatsApp Flows are stateless from Meta's side — WhatsApp just calls your
// data endpoint with a flow_token and the current screen's form data. This model
// is how WE keep track of what a given flow_token has collected so far, screen
// by screen, until the flow completes and we can create a real Order.
const flowSessionSchema = new mongoose.Schema(
  {
    flowToken: { type: String, required: true, unique: true, index: true },
    phone: { type: String, default: "" }, // set when we send the flow message (see whatsappService.sendFlowMessage)
    currentScreen: { type: String, default: "WELCOME" },

    // Freeform bag of everything collected across screens: category, product,
    // quantity, cart[], fulfillment, address, payment method, etc.
    collectedData: { type: mongoose.Schema.Types.Mixed, default: {} },

    status: { type: String, enum: ["in_progress", "completed", "abandoned"], default: "in_progress" },
    resultingOrderId: { type: String }, // set once the flow completes and an Order is created
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlowSession", flowSessionSchema);
