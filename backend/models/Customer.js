const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    line1: { type: String, trim: true },
    city: { type: String, trim: true },
    pincode: { type: String, trim: true },
    landmark: { type: String, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    mapsLink: { type: String, trim: true },
  },
  { _id: false }
);

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: { type: String, trim: true, lowercase: true },
    addresses: [addressSchema],
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

customerSchema.index({ name: "text", phone: "text" });

module.exports = mongoose.model("Customer", customerSchema);
