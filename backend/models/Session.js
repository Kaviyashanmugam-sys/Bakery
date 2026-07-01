const mongoose = require("mongoose");

// One document per customer phone number, holds where they are in the
// conversation flow (step) and whatever data has been collected so far (cart, name, etc.)
// This is what makes the bot "remember" context between messages.
const sessionSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true, index: true },

    step: {
      type: String,
      enum: [
        "MAIN_MENU",
        "ASK_NAME",
        "ASK_MOBILE",
        "SHOW_CATEGORIES",
        "SHOW_PRODUCTS",
        "ASK_QUANTITY",
        "CART_REVIEW",
        "ASK_FULFILLMENT",
        "ASK_ADDRESS",
        "ASK_DATE_TIME",
        "ASK_PAYMENT",
        "ORDER_SUMMARY",
        "AWAIT_ORDER_STATUS_ID",
        "IDLE",
      ],
      default: "IDLE",
    },

    data: {
      customerName: String,
      mobileNumber: String,
      selectedCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      selectedProduct: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      cart: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          name: String,
          price: Number,
          quantity: Number,
        },
      ],
      fulfillmentType: String,
      deliveryAddress: {
        line1: String,
        city: String,
        pincode: String,
        landmark: String,
      },
      preferredDate: String,
      preferredTime: String,
      paymentMethod: String,
    },

    lastInteractionAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
