const mongoose = require("mongoose");

// Every time we send a pre-approved Meta template (order confirmation, status
// updates, payment reminder, etc.) we log it here — separate from the general
// WhatsAppLog — so the admin dashboard can show template-specific delivery info
// (Meta returns a message id + status callbacks tied to templates).
const templateLogSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true }, // must match the name approved in Meta
    language: { type: String, default: "en" },
    phone: { type: String, required: true },
    relatedOrderId: { type: String },
    variables: { type: mongoose.Schema.Types.Mixed }, // the {{1}}, {{2}}... values used
    metaMessageId: { type: String }, // returned by Meta's API on success
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

templateLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model("TemplateLog", templateLogSchema);
