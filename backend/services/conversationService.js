const Category = require("../models/Category");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const wa = require("./whatsappService");
const { getSession, updateSession, resetSession } = require("./sessionService");
const generateOrderId = require("../utils/generateOrderId");
const logger = require("../utils/logger");

const BAKERY_NAME = process.env.BAKERY_NAME || "Our Bakery";
const BAKERY_PHONE = process.env.BAKERY_PHONE || "+91 00000 00000";
const BAKERY_ADDRESS = process.env.BAKERY_ADDRESS || "";
const GST_PERCENT = Number(process.env.GST_PERCENTAGE || 0);

// ---------- Small helpers ----------

function money(n) {
  return `₹${Number(n).toFixed(2)}`;
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartSummaryText(cart) {
  return cart
    .map((i, idx) => `${idx + 1}. ${i.name} x${i.quantity} = ${money(i.price * i.quantity)}`)
    .join("\n");
}

// ---------- Entry point ----------
// message = { type: 'text' | 'interactive', text: string, interactiveId: string|null }
async function handleIncomingMessage(phone, message) {
  const session = await getSession(phone);
  const raw = (message.text || "").trim();
  const rawLower = raw.toLowerCase();
  const replyId = message.interactiveId; // set when user tapped a button/list row

  // Global commands available from any step
  if (["hi", "hello", "hey", "menu", "start"].includes(rawLower) && session.step === "IDLE") {
    return sendMainMenu(phone);
  }
  if (rawLower === "cancel") {
    await resetSession(phone);
    return wa.sendText(phone, "Your order has been cancelled. Type *Hi* anytime to start again. 🙂");
  }

  switch (session.step) {
    case "IDLE":
      return sendMainMenu(phone);

    case "MAIN_MENU":
      return handleMainMenuChoice(phone, replyId);

    case "ASK_NAME":
      return handleName(phone, raw);

    case "ASK_MOBILE":
      return handleMobile(phone, raw);

    case "SHOW_CATEGORIES":
      return handleCategorySelection(phone, replyId);

    case "SHOW_PRODUCTS":
      return handleProductSelection(phone, replyId);

    case "ASK_QUANTITY":
      return handleQuantity(phone, raw);

    case "CART_REVIEW":
      return handleCartReviewChoice(phone, replyId);

    case "ASK_FULFILLMENT":
      return handleFulfillmentChoice(phone, replyId);

    case "ASK_ADDRESS":
      return handleAddress(phone, message, raw);

    case "ASK_DATE_TIME":
      return handleDateTime(phone, raw);

    case "ASK_PAYMENT":
      return handlePaymentChoice(phone, replyId);

    case "ORDER_SUMMARY":
      return handleOrderConfirmation(phone, replyId);

    case "AWAIT_ORDER_STATUS_ID":
      return handleOrderStatusLookup(phone, raw);

    default:
      return sendMainMenu(phone);
  }
}

// ---------- Step 1: Main Menu ----------

async function sendMainMenu(phone) {
  await updateSession(phone, { step: "MAIN_MENU" });
  const body =
    `👋 Welcome to *${BAKERY_NAME}*!\n\n` +
    `Thank you for contacting us.\nPlease choose an option:`;

  const sections = [
    {
      title: "Menu",
      rows: [
        { id: "MENU_ORDER", title: "1️⃣ Place an Order", description: "Order cakes, pastries & more" },
        { id: "MENU_VIEW", title: "2️⃣ View Menu", description: "Browse our full menu" },
        { id: "MENU_SPECIAL", title: "3️⃣ Today's Special", description: "See today's featured items" },
        { id: "MENU_STATUS", title: "4️⃣ Order Status", description: "Track an existing order" },
        { id: "MENU_CONTACT", title: "5️⃣ Contact Us", description: "Address, phone & hours" },
      ],
    },
  ];
  return wa.sendList(phone, body, "View Options", sections);
}

async function handleMainMenuChoice(phone, replyId) {
  switch (replyId) {
    case "MENU_ORDER": {
      const Setting = require("../models/Setting");
      const settings = await Setting.findOne({ singletonKey: "app_settings" });
      if (settings?.orderingMode === "meta_flow" && settings.flowId) {
        await resetSession(phone);
        return wa.sendFlowMessage(phone, {
          flowId: settings.flowId,
          headerText: "Let's place your order",
          bodyText: "Tap below to browse our menu and check out — takes less than a minute.",
        });
      }
      await updateSession(phone, { step: "ASK_NAME" });
      return wa.sendText(phone, "Great! Let's start your order. 😊\n\nWhat's your *name*?");
    }

    case "MENU_VIEW":
      return sendCategoryList(phone, { browsing: true });

    case "MENU_SPECIAL":
      return sendTodaysSpecial(phone);

    case "MENU_STATUS":
      await updateSession(phone, { step: "AWAIT_ORDER_STATUS_ID" });
      return wa.sendText(phone, "Please share your *Order ID* (e.g. BAK-20260701-0001) to check its status.");

    case "MENU_CONTACT":
      await resetSession(phone);
      return wa.sendText(
        phone,
        `📍 *${BAKERY_NAME}*\n\n` +
          `${BAKERY_ADDRESS}\n` +
          `📞 ${BAKERY_PHONE}\n\n` +
          `Type *Hi* anytime to see the menu again.`
      );

    default:
      return sendMainMenu(phone);
  }
}

async function sendTodaysSpecial(phone) {
  const specials = await Product.find({ isTodaysSpecial: true, isAvailable: true }).populate("category");
  await resetSession(phone);
  if (!specials.length) {
    return wa.sendText(phone, "No special items are set for today. Type *Hi* to see our full menu!");
  }
  const text =
    `⭐ *Today's Specials*\n\n` +
    specials.map((p) => `• ${p.name} — ${money(p.price)}`).join("\n") +
    `\n\nType *Hi* to place an order!`;
  return wa.sendText(phone, text);
}

// ---------- Step 2 & 3: Name + Mobile ----------

async function handleName(phone, name) {
  if (!name || name.length < 2) {
    return wa.sendText(phone, "Please enter a valid name.");
  }
  await updateSession(phone, { step: "ASK_MOBILE", dataPatch: { customerName: name } });
  return wa.sendText(phone, `Thanks, ${name}! 📱 Please share your *mobile number*.`);
}

async function handleMobile(phone, mobile) {
  const digitsOnly = mobile.replace(/\D/g, "");
  if (digitsOnly.length < 10) {
    return wa.sendText(phone, "That doesn't look like a valid mobile number. Please enter a 10-digit number.");
  }
  await updateSession(phone, { dataPatch: { mobileNumber: digitsOnly } });
  return sendCategoryList(phone, { browsing: false });
}

// ---------- Step 4: Categories ----------

async function sendCategoryList(phone, { browsing }) {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
  await updateSession(phone, { step: "SHOW_CATEGORIES", dataPatch: { browsing } });

  if (!categories.length) {
    await resetSession(phone);
    return wa.sendText(phone, "Sorry, our menu isn't set up yet. Please contact us directly.");
  }

  const sections = [
    {
      title: "Categories",
      rows: categories.map((c) => ({
        id: `CAT_${c._id}`,
        title: `${c.emoji || "🍰"} ${c.name}`.slice(0, 24),
        description: c.description?.slice(0, 72) || "",
      })),
    },
  ];

  return wa.sendList(phone, "Please choose a category:", "Select Category", sections);
}

async function handleCategorySelection(phone, replyId) {
  if (!replyId || !replyId.startsWith("CAT_")) {
    return wa.sendText(phone, "Please select a category from the list above.");
  }
  const categoryId = replyId.replace("CAT_", "");
  const category = await Category.findById(categoryId);
  if (!category) return sendCategoryList(phone, { browsing: false });

  await updateSession(phone, { dataPatch: { selectedCategory: categoryId } });
  return sendProductList(phone, categoryId);
}

// ---------- Step 5: Products in category ----------

async function sendProductList(phone, categoryId) {
  const products = await Product.find({ category: categoryId, isAvailable: true }).limit(10);
  await updateSession(phone, { step: "SHOW_PRODUCTS" });

  if (!products.length) {
    return wa.sendText(phone, "No items available in this category right now. Please pick another category.");
  }

  const sections = [
    {
      title: "Products",
      rows: products.map((p) => ({
        id: `PROD_${p._id}`,
        title: p.name.slice(0, 24),
        description: `${money(p.price)} / ${p.unit}`,
      })),
    },
  ];

  return wa.sendList(phone, `Here's what we have:`, "Select Item", sections);
}

async function handleProductSelection(phone, replyId) {
  if (!replyId || !replyId.startsWith("PROD_")) {
    return wa.sendText(phone, "Please select a product from the list above.");
  }
  const session = await getSession(phone);

  // "View Menu" browsing mode: just show details, then re-show categories
  if (session.data.browsing) {
    const productId = replyId.replace("PROD_", "");
    const product = await Product.findById(productId);
    if (product) {
      await wa.sendText(
        phone,
        `*${product.name}*\n${product.description || ""}\nPrice: ${money(product.price)} / ${product.unit}`
      );
    }
    return wa.sendText(phone, "Type *Hi* to place an order, or browse more from the menu.");
  }

  const productId = replyId.replace("PROD_", "");
  const product = await Product.findById(productId);
  if (!product) return wa.sendText(phone, "That item is no longer available. Please choose another.");

  await updateSession(phone, { step: "ASK_QUANTITY", dataPatch: { selectedProduct: productId } });
  return wa.sendText(phone, `How many *${product.name}* would you like? (Enter a number, e.g. 2)`);
}

// ---------- Step 6: Quantity + cart ----------

async function handleQuantity(phone, text) {
  const qty = parseInt(text, 10);
  if (!qty || qty < 1 || qty > 100) {
    return wa.sendText(phone, "Please enter a valid quantity (1-100).");
  }

  const session = await getSession(phone);
  const product = await Product.findById(session.data.selectedProduct);
  if (!product) {
    return sendCategoryList(phone, { browsing: false });
  }

  const cart = session.data.cart || [];
  const existingIndex = cart.findIndex((i) => String(i.product) === String(product._id));
  if (existingIndex >= 0) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({ product: product._id, name: product.name, price: product.price, quantity: qty });
  }

  await updateSession(phone, { step: "CART_REVIEW", dataPatch: { cart } });

  const body =
    `Added to cart: ${product.name} x${qty}\n\n` +
    `🛒 *Your Cart*\n${cartSummaryText(cart)}\n\n` +
    `Subtotal: ${money(cartTotal(cart))}\n\nWould you like to add more items?`;

  return wa.sendButtons(phone, body, [
    { id: "ADD_MORE_YES", title: "➕ Add More" },
    { id: "ADD_MORE_NO", title: "✅ Proceed" },
  ]);
}

async function handleCartReviewChoice(phone, replyId) {
  if (replyId === "ADD_MORE_YES") {
    return sendCategoryList(phone, { browsing: false });
  }
  if (replyId === "ADD_MORE_NO") {
    const session = await getSession(phone);
    const cart = session.data.cart || [];
    if (!cart.length) {
      return wa.sendText(phone, "Your cart is empty. Please add at least one item.");
    }
    const subtotal = cartTotal(cart);
    const gstAmount = GST_PERCENT ? Math.round((subtotal * GST_PERCENT) / 100) : 0;
    const total = subtotal + gstAmount;

    const body =
      `🛒 *Cart Summary*\n${cartSummaryText(cart)}\n\n` +
      `Subtotal: ${money(subtotal)}\n` +
      (gstAmount ? `GST (${GST_PERCENT}%): ${money(gstAmount)}\n` : "") +
      `*Total: ${money(total)}*\n\n` +
      `Would you like *Pickup* or *Delivery*?`;

    await updateSession(phone, { step: "ASK_FULFILLMENT" });
    return wa.sendButtons(phone, body, [
      { id: "FULFILL_PICKUP", title: "🏪 Pickup" },
      { id: "FULFILL_DELIVERY", title: "🚚 Delivery" },
    ]);
  }
  return wa.sendText(phone, "Please tap one of the buttons above.");
}

// ---------- Step 7: Pickup / Delivery ----------

async function handleFulfillmentChoice(phone, replyId) {
  if (replyId === "FULFILL_PICKUP") {
    await updateSession(phone, { step: "ASK_DATE_TIME", dataPatch: { fulfillmentType: "pickup" } });
    return wa.sendText(phone, "📅 Please share your preferred *pickup date and time*.\n(e.g. 05-Jul-2026, 5:00 PM)");
  }
  if (replyId === "FULFILL_DELIVERY") {
    await updateSession(phone, { step: "ASK_ADDRESS", dataPatch: { fulfillmentType: "delivery" } });
    // Prefer WhatsApp's native location-share (precise GPS) over typed text.
    // We still accept a typed address as a fallback for older WhatsApp clients.
    await wa.sendLocationRequest(
      phone,
      "📍 Tap below to share your delivery location — this helps us find you accurately."
    );
    return wa.sendText(
      phone,
      "If you'd rather type it, send your full *delivery address* instead (house/street, city, pincode, landmark)."
    );
  }
  return wa.sendText(phone, "Please tap Pickup or Delivery.");
}

async function handleAddress(phone, message, text) {
  // Customer shared their live GPS location via WhatsApp — this is the precise path.
  if (message.type === "location" && message.location) {
    const { latitude, longitude, address, name } = message.location;
    const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    const line1 = [name, address].filter(Boolean).join(", ") || "Shared location";

    await updateSession(phone, {
      step: "ASK_DATE_TIME",
      dataPatch: { deliveryAddress: { line1, latitude, longitude, mapsLink } },
    });
    return wa.sendText(
      phone,
      `📍 Location received!\n\n📅 Please share your preferred *delivery date and time*.\n(e.g. 05-Jul-2026, 5:00 PM)`
    );
  }

  // Fallback: typed address
  if (!text || text.length < 8) {
    return wa.sendText(phone, "Please share your location using the button above, or type your full delivery address.");
  }
  await updateSession(phone, {
    step: "ASK_DATE_TIME",
    dataPatch: { deliveryAddress: { line1: text } },
  });
  return wa.sendText(phone, "📅 Please share your preferred *delivery date and time*.\n(e.g. 05-Jul-2026, 5:00 PM)");
}

// ---------- Step 8: Date/Time ----------

async function handleDateTime(phone, text) {
  if (!text || text.length < 4) {
    return wa.sendText(phone, "Please share a valid date and time.");
  }
  const [datePart, ...timeParts] = text.split(",");
  const preferredDate = datePart?.trim() || text.trim();
  const preferredTime = timeParts.join(",").trim() || "Not specified";

  await updateSession(phone, { step: "ASK_PAYMENT", dataPatch: { preferredDate, preferredTime } });

  const body = "💳 How would you like to pay?";
  return wa.sendButtons(phone, body, [
    { id: "PAY_CASH", title: "💵 Cash" },
    { id: "PAY_UPI", title: "📲 UPI" },
    { id: "PAY_CARD", title: "💳 Card" },
  ]);
}

// ---------- Step 9: Payment ----------

async function handlePaymentChoice(phone, replyId) {
  const map = { PAY_CASH: "cash", PAY_UPI: "upi", PAY_CARD: "card" };
  const method = map[replyId];
  if (!method) return wa.sendText(phone, "Please tap one of the payment options above.");

  await updateSession(phone, { step: "ORDER_SUMMARY", dataPatch: { paymentMethod: method } });
  return sendOrderSummary(phone);
}

async function sendOrderSummary(phone) {
  const session = await getSession(phone);
  const d = session.data;
  const cart = d.cart || [];
  const subtotal = cartTotal(cart);
  const gstAmount = GST_PERCENT ? Math.round((subtotal * GST_PERCENT) / 100) : 0;
  const total = subtotal + gstAmount;

  const body =
    `📋 *Order Summary*\n\n` +
    `Name: ${d.customerName}\n` +
    `Mobile: ${d.mobileNumber}\n\n` +
    `${cartSummaryText(cart)}\n\n` +
    `Subtotal: ${money(subtotal)}\n` +
    (gstAmount ? `GST (${GST_PERCENT}%): ${money(gstAmount)}\n` : "") +
    `*Total: ${money(total)}*\n\n` +
    `Mode: ${d.fulfillmentType === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}\n` +
    (d.fulfillmentType === "delivery" ? `Address: ${d.deliveryAddress?.line1}\n` : "") +
    `When: ${d.preferredDate} at ${d.preferredTime}\n` +
    `Payment: ${d.paymentMethod?.toUpperCase()}\n\n` +
    `Shall I confirm this order?`;

  return wa.sendButtons(phone, body, [
    { id: "CONFIRM_YES", title: "✅ Confirm" },
    { id: "CONFIRM_NO", title: "❌ Cancel" },
  ]);
}

// ---------- Step 10: Confirmation -> Save order ----------

async function handleOrderConfirmation(phone, replyId) {
  if (replyId === "CONFIRM_NO") {
    await resetSession(phone);
    return wa.sendText(phone, "Order cancelled. Type *Hi* anytime to start a new order. 🙂");
  }
  if (replyId !== "CONFIRM_YES") {
    return wa.sendText(phone, "Please tap Confirm or Cancel.");
  }

  try {
    const session = await getSession(phone);
    const d = session.data;
    const cart = d.cart || [];
    const subtotal = cartTotal(cart);
    const gstAmount = GST_PERCENT ? Math.round((subtotal * GST_PERCENT) / 100) : 0;
    const total = subtotal + gstAmount;

    // Find or create the customer record
    let customer = await Customer.findOne({ phone: d.mobileNumber || phone });
    if (!customer) {
      customer = await Customer.create({
        name: d.customerName,
        phone: d.mobileNumber || phone,
        addresses: d.deliveryAddress ? [d.deliveryAddress] : [],
      });
    } else {
      customer.name = d.customerName || customer.name;
      if (d.deliveryAddress) customer.addresses.push(d.deliveryAddress);
    }

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      customer: customer._id,
      customerName: d.customerName,
      customerPhone: d.mobileNumber || phone,
      items: cart.map((i) => ({
        product: i.product,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.price * i.quantity,
      })),
      itemsTotal: subtotal,
      gstPercentage: GST_PERCENT,
      gstAmount,
      totalAmount: total,
      fulfillmentType: d.fulfillmentType,
      deliveryAddress: d.deliveryAddress,
      preferredDate: d.preferredDate,
      preferredTime: d.preferredTime,
      paymentMethod: d.paymentMethod,
      status: "pending",
      statusHistory: [{ status: "pending", changedBy: "customer" }],
    });

    customer.totalOrders += 1;
    customer.totalSpent += total;
    customer.lastOrderAt = new Date();
    await customer.save();

    await wa.sendOrderConfirmation(phone, order);
    order.whatsappConfirmationSent = true;
    await order.save();

    await resetSession(phone);
    return order;
  } catch (error) {
    logger.error(`Order creation failed for ${phone}: ${error.message}`);
    return wa.sendText(phone, "Sorry, something went wrong while saving your order. Please try again or contact us.");
  }
}

// ---------- Order status lookup ----------

async function handleOrderStatusLookup(phone, text) {
  const orderId = text.trim().toUpperCase();
  const order = await Order.findOne({ orderId });
  await resetSession(phone);

  if (!order) {
    return wa.sendText(phone, `No order found with ID *${orderId}*. Please check and try again by typing *Hi*.`);
  }

  return wa.sendText(
    phone,
    `📦 *Order ${order.orderId}*\n` +
      `Status: *${order.status.replace(/_/g, " ").toUpperCase()}*\n` +
      `Total: ${money(order.totalAmount)}\n` +
      `Placed on: ${order.createdAt.toDateString()}`
  );
}

module.exports = { handleIncomingMessage };
