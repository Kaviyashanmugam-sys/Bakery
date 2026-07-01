const mongoose = require("mongoose");

// Every outbound WhatsApp message the bot sends is logged here so
// the admin dashboard can show a "WhatsApp Notification Logs" screen.
const whatsappLogSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true },
    direction: { type: String, enum: ["outbound", "inbound"], default: "outbound" },
    type: { type: String, default: "text" }, // text, interactive, template
    messageContent: { type: String },
    relatedOrderId: { type: String },
    status: { type: String, enum: ["sent", "failed"], default: "sent" },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

whatsappLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WhatsAppLog", whatsappLogSchema);
