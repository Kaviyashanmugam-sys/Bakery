const axios = require("axios");
const logger = require("../utils/logger");
const WhatsAppLog = require("../models/WhatsAppLog");

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;

const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  },
});

// Internal helper: sends the raw payload to Meta's Graph API and logs the result
async function sendRaw(payload, { phone, type, contentForLog, relatedOrderId }) {
  try {
    await client.post("", payload);
    await WhatsAppLog.create({
      phone,
      direction: "outbound",
      type,
      messageContent: contentForLog,
      relatedOrderId,
      status: "sent",
    });
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    logger.error(`WhatsApp send failed for ${phone}: ${errMsg}`);
    await WhatsAppLog.create({
      phone,
      direction: "outbound",
      type,
      messageContent: contentForLog,
      relatedOrderId,
      status: "failed",
      errorMessage: errMsg,
    });
    throw error;
  }
}

// Plain text message
async function sendText(to, text, relatedOrderId = null) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  };
  return sendRaw(payload, { phone: to, type: "text", contentForLog: text, relatedOrderId });
}

// Interactive button message (max 3 buttons, Meta limitation)
// buttons: [{ id: 'PLACE_ORDER', title: '1️⃣ Place Order' }, ...]
async function sendButtons(to, bodyText, buttons, headerText = null) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      ...(headerText && { header: { type: "text", text: headerText } }),
      body: { text: bodyText },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title.slice(0, 20) },
        })),
      },
    },
  };
  return sendRaw(payload, { phone: to, type: "interactive", contentForLog: bodyText });
}

// Interactive list message (used for main menu, categories, products - can hold many options)
// sections: [{ title: 'Cakes', rows: [{ id: 'PROD_123', title: 'Chocolate Cake', description: '₹450' }] }]
async function sendList(to, bodyText, buttonLabel, sections, headerText = null) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "list",
      ...(headerText && { header: { type: "text", text: headerText } }),
      body: { text: bodyText },
      action: {
        button: buttonLabel,
        sections,
      },
    },
  };
  return sendRaw(payload, { phone: to, type: "interactive", contentForLog: bodyText });
}

// Order confirmation / status update - simple templated text (works without pre-approved templates
// as long as it's inside the 24-hour customer service window)
async function sendOrderConfirmation(to, order) {
  const itemsList = order.items
    .map((i) => `• ${i.name} x${i.quantity} = ₹${i.subtotal}`)
    .join("\n");

  const text =
    `✅ *Order Confirmed!*\n\n` +
    `Order ID: *${order.orderId}*\n\n` +
    `${itemsList}\n\n` +
    `Items Total: ₹${order.itemsTotal}\n` +
    (order.gstAmount ? `GST (${order.gstPercentage}%): ₹${order.gstAmount}\n` : "") +
    (order.deliveryCharge ? `Delivery Charge: ₹${order.deliveryCharge}\n` : "") +
    `*Total: ₹${order.totalAmount}*\n\n` +
    `Mode: ${order.fulfillmentType === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}\n` +
    (order.fulfillmentType === "delivery" && order.deliveryAddress?.mapsLink
      ? `Delivery to: ${order.deliveryAddress.mapsLink}\n`
      : order.fulfillmentType === "delivery" && order.deliveryAddress?.line1
      ? `Delivery to: ${order.deliveryAddress.line1}\n`
      : "") +
    `When: ${order.preferredDate} at ${order.preferredTime}\n` +
    `Payment: ${order.paymentMethod.toUpperCase()}\n\n` +
    `We'll notify you here as your order progresses. Thank you for ordering with us! 🍰`;

  return sendText(to, text, order.orderId);
}

// Sent whenever admin changes an order's status from the dashboard
async function sendStatusUpdate(to, order) {
  const statusMessages = {
    confirmed: "✅ Your order has been *confirmed* and is queued for preparation.",
    preparing: "👩‍🍳 Your order is now being *prepared* in our kitchen.",
    ready: "📦 Your order is *ready*! Please arrange for pickup.",
    out_for_delivery: "🚚 Your order is *out for delivery*.",
    completed: "🎉 Your order has been *completed*. Thank you for choosing us!",
    cancelled: "❌ Your order has been *cancelled*. Contact us if this was unexpected.",
  };

  const text =
    `Order Update — *${order.orderId}*\n\n` +
    (statusMessages[order.status] || `Status changed to: ${order.status}`);

  return sendText(to, text, order.orderId);
}

// Sends the initial WhatsApp Flow message that opens the Flow UI for the customer.
// We generate our own flow_token here and create the FlowSession up front so
// that by the time Meta calls our data endpoint with action=INIT, we already
// know which phone number this flow_token belongs to.
async function sendFlowMessage(to, { flowId, headerText, bodyText, footerText = "Tap to continue", screen = "WELCOME" }) {
  const FlowSession = require("../models/FlowSession");
  const flowToken = `flow_${to}_${Date.now()}`;
  await FlowSession.create({ flowToken, phone: to, currentScreen: screen, status: "in_progress" });

  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "flow",
      header: { type: "text", text: headerText },
      body: { text: bodyText },
      footer: { text: footerText },
      action: {
        name: "flow",
        parameters: {
          flow_message_version: "3",
          flow_token: flowToken,
          flow_id: flowId,
          flow_cta: "Start Order",
          flow_action: "navigate",
          flow_action_payload: { screen },
        },
      },
    },
  };
  return sendRaw(payload, { phone: to, type: "interactive", contentForLog: `[Flow] ${headerText}` });
}

// Sends WhatsApp's native "Request Location" prompt. Unlike a Meta Flow screen,
// this uses the phone's actual GPS (via WhatsApp's location picker), so it's far
// more accurate than a customer typing an address. The reply comes back as an
// inbound message of type "location" with { latitude, longitude, address?, name? }.
async function sendLocationRequest(to, bodyText = "📍 Please share your delivery location for accurate delivery.") {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "location_request_message",
      body: { text: bodyText },
      action: { name: "send_location" },
    },
  };
  return sendRaw(payload, { phone: to, type: "interactive", contentForLog: "[Location Request] " + bodyText });
}

module.exports = {
  sendText,
  sendButtons,
  sendList,
  sendFlowMessage,
  sendLocationRequest,
  sendOrderConfirmation,
  sendStatusUpdate,
};
