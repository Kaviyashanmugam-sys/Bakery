const mongoose = require("mongoose");

// Stores the RAW payload of every inbound call Meta makes to POST /webhook,
// before we've parsed/interpreted it. Useful for debugging Flow issues,
// replaying a message, or proving what Meta actually sent during a dispute.
// This is intentionally separate from WhatsAppLog (which stores parsed,
// human-readable message content).
const webhookLogSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ["messages_webhook", "flow_data_endpoint"], required: true },
    rawPayload: { type: mongoose.Schema.Types.Mixed, required: true },
    processed: { type: Boolean, default: false },
    processingError: { type: String },
  },
  { timestamps: true }
);

webhookLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
