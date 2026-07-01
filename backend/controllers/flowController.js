const { decryptRequest, encryptResponse } = require("../services/flowEncryption");
const FlowSession = require("../models/FlowSession");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Setting = require("../models/Setting");
const WebhookLog = require("../models/WebhookLog");
const generateOrderId = require("../utils/generateOrderId");
const wa = require("../services/whatsappService");
const logger = require("../utils/logger");

const GST_PERCENT = Number(process.env.GST_PERCENTAGE || 0);

function money(n) {
  return `₹${Number(n).toFixed(2)}`;
}

// POST /api/flow-endpoint
// Every call from WhatsApp for this Flow (init, each screen's "Next", back navigation,
// and Meta's periodic health-check ping) lands here, fully encrypted.
async function handleFlowEndpoint(req, res) {
  let decryptedBody, aesKey, iv;

  try {
    const result = decryptRequest(
      req.body,
      process.env.FLOW_PRIVATE_KEY.replace(/\\n/g, "\n"),
      process.env.FLOW_PRIVATE_KEY_PASSPHRASE
    );
    decryptedBody = result.decryptedBody;
    aesKey = result.aesKey;
    iv = result.iv;
  } catch (error) {
    logger.error(`Flow decryption failed: ${error.message}`);
    // 421 tells WhatsApp the encryption key may be stale, prompting a refresh
    return res.status(421).send();
  }

  await WebhookLog.create({ source: "flow_data_endpoint", rawPayload: decryptedBody, processed: false });

  try {
    const responsePayload = await routeFlowAction(decryptedBody);
    const encrypted = encryptResponse(responsePayload, aesKey, iv);
    return res.status(200).send(encrypted);
  } catch (error) {
    logger.error(`Flow processing failed: ${error.message}`);
    return res.status(500).send();
  }
}

async function routeFlowAction(body) {
  const { action, screen, data, flow_token } = body;

  // Meta pings this endpoint periodically to verify it's alive
  if (action === "ping") {
    return { version: "3.0", data: { status: "active" } };
  }

  // First time the Flow opens for this conversation
  if (action === "INIT") {
    const settings = await Setting.findOne({ singletonKey: "app_settings" });
    // Note: FlowSession is created with the customer's phone number at the moment
    // we SEND the flow message (see whatsappService.sendFlowMessage). Here we only
    // update its screen/status — we deliberately don't touch `phone` so we don't
    // clobber it if a session already exists for this flow_token.
    await FlowSession.findOneAndUpdate(
      { flowToken: flow_token },
      { currentScreen: "WELCOME", status: "in_progress" },
      { upsert: true }
    );
    return {
      version: "3.0",
      screen: "WELCOME",
      data: { bakery_name: settings?.bakeryName || process.env.BAKERY_NAME || "Our Bakery" },
    };
  }

  if (action === "BACK") {
    // Simplest correct behavior: re-send the previous screen's last known data
    const session = await FlowSession.findOne({ flowToken: flow_token });
    return { version: "3.0", screen: session?.currentScreen || "WELCOME", data: {} };
  }

  if (action === "data_exchange") {
    return handleDataExchange({ screen, data, flow_token });
  }

  return { version: "3.0", data: { status: "active" } };
}

// The core business logic — one branch per "trigger" our Flow JSON sends
async function handleDataExchange({ screen, data, flow_token }) {
  const session = await FlowSession.findOneAndUpdate(
    { flowToken: flow_token },
    { flowToken: flow_token },
    { upsert: true, new: true }
  );
  const collected = session.collectedData || {};

  switch (data.trigger) {
    case "get_categories": {
      const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1 });
      await saveSession(flow_token, "CATEGORY_SELECTION", collected);
      return {
        version: "3.0",
        screen: "CATEGORY_SELECTION",
        data: { categories: categories.map((c) => ({ id: String(c._id), title: `${c.emoji} ${c.name}` })) },
      };
    }

    case "get_products": {
      const category = await Category.findById(data.category_id);
      const products = await Product.find({ category: data.category_id, isAvailable: true }).limit(10);
      if (!products.length) {
        return {
          version: "3.0",
          screen: "CATEGORY_SELECTION",
          data: { categories: [], error_message: "No items in that category right now — please pick another." },
        };
      }
      await saveSession(flow_token, "PRODUCTS", { ...collected, selectedCategoryId: data.category_id });
      return {
        version: "3.0",
        screen: "PRODUCTS",
        data: {
          category_title: category?.name || "Products",
          products: products.map((p) => ({ id: String(p._id), title: p.name, description: `${money(p.price)} / ${p.unit}` })),
        },
      };
    }

    case "select_product": {
      const product = await Product.findById(data.product_id);
      if (!product) {
        return { version: "3.0", screen: "PRODUCTS", data: { products: [], error_message: "That item is no longer available." } };
      }
      await saveSession(flow_token, "QUANTITY", { ...collected, selectedProductId: data.product_id });
      return {
        version: "3.0",
        screen: "QUANTITY",
        data: { product_name: product.name, product_price: `${money(product.price)} / ${product.unit}` },
      };
    }

    case "add_to_cart": {
      const qty = parseInt(data.quantity, 10);
      if (!qty || qty < 1 || qty > 50) {
        return {
          version: "3.0",
          screen: "QUANTITY",
          data: { product_name: "", product_price: "", error_message: "Please enter a quantity between 1 and 50." },
        };
      }
      const product = await Product.findById(collected.selectedProductId);
      const cart = collected.cart || [];
      const existing = cart.find((i) => i.productId === String(product._id));
      if (existing) existing.quantity += qty;
      else cart.push({ productId: String(product._id), name: product.name, price: product.price, quantity: qty });

      await saveSession(flow_token, "CART", { ...collected, cart });
      return { version: "3.0", screen: "CART", data: buildCartData(cart) };
    }

    case "go_to_fulfillment": {
      if (!collected.cart?.length) {
        return { version: "3.0", screen: "CART", data: { ...buildCartData([]), error_message: "Your cart is empty." } };
      }
      await saveSession(flow_token, "DELIVERY_PICKUP", collected);
      return { version: "3.0", screen: "DELIVERY_PICKUP", data: {} };
    }

    case "set_fulfillment": {
      const fulfillmentType = data.fulfillment_type;
      const updated = { ...collected, fulfillmentType };
      if (fulfillmentType === "pickup") {
        await saveSession(flow_token, "PAYMENT", updated);
        return { version: "3.0", screen: "PAYMENT", data: {} };
      }
      await saveSession(flow_token, "ADDRESS", updated);
      return { version: "3.0", screen: "ADDRESS", data: {} };
    }

    case "set_address": {
      if (!/^\d{6}$/.test(String(data.pincode || ""))) {
        return { version: "3.0", screen: "ADDRESS", data: { error_message: "Please enter a valid 6-digit pincode." } };
      }
      const updated = {
        ...collected,
        deliveryAddress: {
          line1: data.address_line,
          city: data.city,
          pincode: data.pincode,
          landmark: data.landmark || "",
        },
      };
      await saveSession(flow_token, "PAYMENT", updated);
      return { version: "3.0", screen: "PAYMENT", data: {} };
    }

    case "set_payment": {
      const updated = {
        ...collected,
        preferredDate: data.preferred_date,
        preferredTime: data.preferred_time,
        paymentMethod: data.payment_method,
      };
      await saveSession(flow_token, "CONFIRMATION", updated);
      const { subtotal, gstAmount, total } = calcTotals(updated.cart);
      const summary =
        updated.cart.map((i) => `${i.name} x${i.quantity} = ${money(i.price * i.quantity)}`).join("\n") +
        `\n\nSubtotal: ${money(subtotal)}` +
        (gstAmount ? `\nGST: ${money(gstAmount)}` : "") +
        `\nMode: ${updated.fulfillmentType}` +
        `\nWhen: ${updated.preferredDate} ${updated.preferredTime}` +
        `\nPayment: ${updated.paymentMethod?.toUpperCase()}`;
      return { version: "3.0", screen: "CONFIRMATION", data: { order_summary: summary, total_amount: money(total) } };
    }

    case "place_order": {
      const order = await createOrderFromFlow(collected, session.phone);
      await FlowSession.updateOne(
        { flowToken: flow_token },
        { status: "completed", resultingOrderId: order.orderId }
      );
      return { version: "3.0", screen: "SUCCESS", data: { order_id: order.orderId } };
    }

    default:
      return { version: "3.0", screen: screen || "WELCOME", data: {} };
  }
}

function buildCartData(cart) {
  const { subtotal } = calcTotals(cart);
  const summary = cart.length
    ? cart.map((i) => `${i.name} x${i.quantity} = ${money(i.price * i.quantity)}`).join("\n")
    : "Your cart is empty.";
  return { cart_summary: summary, cart_total: money(subtotal) };
}

function calcTotals(cart = []) {
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const gstAmount = GST_PERCENT ? Math.round((subtotal * GST_PERCENT) / 100) : 0;
  return { subtotal, gstAmount, total: subtotal + gstAmount };
}

async function saveSession(flowToken, screen, dataPatch) {
  await FlowSession.updateOne(
    { flowToken },
    { currentScreen: screen, collectedData: dataPatch },
    { upsert: true }
  );
}

async function createOrderFromFlow(collected, phone) {
  const { subtotal, gstAmount, total } = calcTotals(collected.cart);

  let customer = await Customer.findOne({ phone });
  if (!customer) {
    customer = await Customer.create({ phone, addresses: collected.deliveryAddress ? [collected.deliveryAddress] : [] });
  }

  const orderId = await generateOrderId();
  const order = await Order.create({
    orderId,
    customer: customer._id,
    customerName: customer.name || "WhatsApp Customer",
    customerPhone: phone,
    items: collected.cart.map((i) => ({
      product: i.productId,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      subtotal: i.price * i.quantity,
    })),
    itemsTotal: subtotal,
    gstPercentage: GST_PERCENT,
    gstAmount,
    totalAmount: total,
    fulfillmentType: collected.fulfillmentType,
    deliveryAddress: collected.deliveryAddress,
    preferredDate: collected.preferredDate,
    preferredTime: collected.preferredTime,
    paymentMethod: collected.paymentMethod,
    status: "pending",
    statusHistory: [{ status: "pending", changedBy: "customer_flow" }],
  });

  customer.totalOrders += 1;
  customer.totalSpent += total;
  customer.lastOrderAt = new Date();
  await customer.save();

  try {
    await wa.sendOrderConfirmation(phone, order);
    order.whatsappConfirmationSent = true;
    await order.save();
  } catch (e) {
    logger.error(`Post-flow confirmation send failed: ${e.message}`);
  }

  return order;
}

module.exports = { handleFlowEndpoint };
