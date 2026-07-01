const axios = require("axios");
const TemplateLog = require("../models/TemplateLog");
const logger = require("../utils/logger");

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v20.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_TOKEN;
const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;

const client = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
});

// Sends any approved template by name, with an ordered list of body variable values.
// `templateName` MUST exactly match a template already approved in Meta Business Manager
// (see docs/TEMPLATES.md for the exact JSON to submit for each one).
async function sendTemplate({ to, templateName, language = "en", bodyParams = [], relatedOrderId }) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: language },
      components: bodyParams.length
        ? [
            {
              type: "body",
              parameters: bodyParams.map((text) => ({ type: "text", text: String(text) })),
            },
          ]
        : [],
    },
  };

  try {
    const { data } = await client.post("", payload);
    await TemplateLog.create({
      templateName,
      language,
      phone: to,
      relatedOrderId,
      variables: bodyParams,
      metaMessageId: data.messages?.[0]?.id,
      status: "sent",
    });
    return data;
  } catch (error) {
    const errMsg = error.response?.data?.error?.message || error.message;
    logger.error(`Template send failed (${templateName}) to ${to}: ${errMsg}`);
    await TemplateLog.create({
      templateName,
      language,
      phone: to,
      relatedOrderId,
      variables: bodyParams,
      status: "failed",
      errorMessage: errMsg,
    });
    throw error;
  }
}

// Convenience wrappers — one per template, matching docs/TEMPLATES.md variable order
const templates = {
  welcome: (to, { bakeryName }) =>
    sendTemplate({ to, templateName: "bakery_welcome", bodyParams: [bakeryName] }),

  orderReceived: (to, { customerName, orderId }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_order_received", bodyParams: [customerName, orderId], relatedOrderId }),

  orderConfirmation: (to, { orderId, totalAmount, preferredDate }, relatedOrderId) =>
    sendTemplate({
      to,
      templateName: "bakery_order_confirmation",
      bodyParams: [orderId, totalAmount, preferredDate],
      relatedOrderId,
    }),

  orderPreparing: (to, { orderId }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_order_preparing", bodyParams: [orderId], relatedOrderId }),

  outForDelivery: (to, { orderId, eta }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_out_for_delivery", bodyParams: [orderId, eta], relatedOrderId }),

  readyForPickup: (to, { orderId, bakeryAddress }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_ready_for_pickup", bodyParams: [orderId, bakeryAddress], relatedOrderId }),

  orderDelivered: (to, { orderId }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_order_delivered", bodyParams: [orderId], relatedOrderId }),

  orderCancelled: (to, { orderId, reason }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_order_cancelled", bodyParams: [orderId, reason], relatedOrderId }),

  paymentReminder: (to, { orderId, amountDue }, relatedOrderId) =>
    sendTemplate({ to, templateName: "bakery_payment_reminder", bodyParams: [orderId, amountDue], relatedOrderId }),
};

module.exports = { sendTemplate, templates };
