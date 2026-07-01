const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, enum: ["cash", "upi", "card"], required: true },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    transactionRef: { type: String, trim: true }, // UPI ref / card auth code if provided manually by admin
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
