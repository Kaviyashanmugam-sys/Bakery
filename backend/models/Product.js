const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "piece" }, // piece, kg, box, etc.
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    isVeg: { type: Boolean, default: true },
    isTodaysSpecial: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    stock: { type: Number, default: 999 }, // simple stock counter, optional use
    gstApplicable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ name: "text" });
productSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model("Product", productSchema);
