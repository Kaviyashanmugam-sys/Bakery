const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true }, // snapshot of product name at order time
    price: { type: Number, required: true }, // snapshot of unit price at order time
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true }, // e.g. BAK-20260701-0001
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },

    items: [orderItemSchema],

    itemsTotal: { type: Number, required: true },
    gstPercentage: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    fulfillmentType: { type: String, enum: ["pickup", "delivery"], required: true },
    deliveryAddress: {
      line1: String,
      city: String,
      pincode: String,
      landmark: String,
    },

    preferredDate: { type: String }, // as provided by customer, e.g. "2026-07-05"
    preferredTime: { type: String }, // e.g. "5:00 PM"

    paymentMethod: { type: String, enum: ["cash", "upi", "card"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },

    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"],
      default: "pending",
    },

    notes: { type: String, trim: true },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: String, default: "system" },
      },
    ],

    whatsappConfirmationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1 });

module.exports = mongoose.model("Order", orderSchema);
