const mongoose = require("mongoose");

// Single-document "key-value" style settings collection. We keep everything
// in one document (singleton pattern) so the Settings/Meta Configuration
// admin pages have one simple object to read and update.
const settingSchema = new mongoose.Schema(
  {
    singletonKey: { type: String, default: "app_settings", unique: true },

    bakeryName: { type: String, default: "Sweet Crust Bakery" },
    bakeryPhone: { type: String },
    bakeryAddress: { type: String },
    gstPercentage: { type: Number, default: 5 },

    // Meta / WhatsApp Cloud API configuration (the access token itself stays in
    // .env for security — this only stores non-secret, admin-editable identifiers)
    whatsappPhoneNumberId: { type: String },
    whatsappBusinessAccountId: { type: String },
    whatsappApiVersion: { type: String, default: "v20.0" },

    // Meta Flow configuration
    flowId: { type: String },
    flowVersion: { type: String, default: "6.0" },
    flowEndpointUri: { type: String },
    orderingMode: { type: String, enum: ["interactive_messages", "meta_flow"], default: "interactive_messages" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Setting", settingSchema);
