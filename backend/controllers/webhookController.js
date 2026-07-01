const { handleIncomingMessage } = require("../services/conversationService");
const WhatsAppLog = require("../models/WhatsAppLog");
const logger = require("../utils/logger");

// GET /webhook - Meta verification handshake
function verifyWebhook(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info("Webhook verified successfully");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// Extracts a simplified { type, text, interactiveId } from Meta's raw message payload
function parseIncomingMessage(msg) {
  if (msg.type === "text") {
    return { type: "text", text: msg.text.body, interactiveId: null };
  }
  if (msg.type === "interactive") {
    const interactive = msg.interactive;
    if (interactive.type === "button_reply") {
      return { type: "interactive", text: interactive.button_reply.title, interactiveId: interactive.button_reply.id };
    }
    if (interactive.type === "list_reply") {
      return { type: "interactive", text: interactive.list_reply.title, interactiveId: interactive.list_reply.id };
    }
  }
  return { type: "unknown", text: "", interactiveId: null };
}

// POST /webhook - receives inbound messages / status updates from Meta
async function receiveWebhook(req, res) {
  // Always respond 200 quickly so Meta doesn't retry/backoff
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (!messages || !messages.length) return; // could be a status callback, ignore

    for (const msg of messages) {
      const phone = msg.from;
      const parsed = parseIncomingMessage(msg);

      await WhatsAppLog.create({
        phone,
        direction: "inbound",
        type: parsed.type,
        messageContent: parsed.text,
        status: "sent",
      });

      await handleIncomingMessage(phone, parsed);
    }
  } catch (error) {
    logger.error(`Error processing webhook: ${error.message}`);
  }
}

module.exports = { verifyWebhook, receiveWebhook };
