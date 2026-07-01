const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    // Emoji shown in WhatsApp interactive list next to the category name
    emoji: { type: String, default: "🍰" },
    description: { type: String, trim: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
