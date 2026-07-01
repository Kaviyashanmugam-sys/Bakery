# WhatsApp Message Templates

All 9 templates below need to be created and approved in **Meta Business Manager →
WhatsApp Manager → Message Templates → Create Template** before they can be sent.
Template names below are lowercase_snake_case because that's a Meta requirement.

Once approved, they're sent via `backend/services/templateService.js` — see
`templates.<key>(...)` for the matching wrapper function for each one.

---

## 1. Welcome Template

- **Name:** `bakery_welcome`
- **Category:** MARKETING
- **Language:** en (English)
- **Variables:** `{{1}}` = bakery name

**Meta Template JSON (submit this in the Create Template form):**
```json
{
  "name": "bakery_welcome",
  "category": "MARKETING",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "👋 Welcome to {{1}}! Thanks for reaching out. Reply *Hi* anytime to see our menu and place an order.",
      "example": { "body_text": [["Sweet Crust Bakery"]] }
    }
  ]
}
```

**API Payload (sending it):**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_welcome",
    "language": { "code": "en" },
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "Sweet Crust Bakery" }] }
    ]
  }
}
```

**Sample Response:**
```json
{
  "messaging_product": "whatsapp",
  "contacts": [{ "input": "919999999999", "wa_id": "919999999999" }],
  "messages": [{ "id": "wamid.HBgLOTE5OTk5OTk5OTk5FQIAERgSNzZBQjQ..." }]
}
```

---

## 2. Order Received Template

- **Name:** `bakery_order_received`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = customer name, `{{2}}` = order ID

```json
{
  "name": "bakery_order_received",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "Hi {{1}}, we've received your order *{{2}}*! We'll confirm it shortly.",
      "example": { "body_text": [["Kaviya", "BAK-20260701-0001"]] }
    }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_order_received",
    "language": { "code": "en" },
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "Kaviya" }, { "type": "text", "text": "BAK-20260701-0001" }] }
    ]
  }
}
```

**Sample Response:** same shape as Template 1 (a `messages[0].id`).

---

## 3. Order Confirmation Template

- **Name:** `bakery_order_confirmation`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID, `{{2}}` = total amount, `{{3}}` = preferred date

```json
{
  "name": "bakery_order_confirmation",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "✅ Order *{{1}}* confirmed! Total: ₹{{2}}. Scheduled for {{3}}. We'll keep you posted here.",
      "example": { "body_text": [["BAK-20260701-0001", "715", "05-Jul-2026"]] }
    }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_order_confirmation",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "BAK-20260701-0001" },
          { "type": "text", "text": "715" },
          { "type": "text", "text": "05-Jul-2026" }
        ]
      }
    ]
  }
}
```

---

## 4. Order Preparing Template

- **Name:** `bakery_order_preparing`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID

```json
{
  "name": "bakery_order_preparing",
  "category": "UTILITY",
  "language": "en",
  "components": [
    { "type": "BODY", "text": "👩‍🍳 Order *{{1}}* is now being prepared in our kitchen!", "example": { "body_text": [["BAK-20260701-0001"]] } }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_order_preparing",
    "language": { "code": "en" },
    "components": [{ "type": "body", "parameters": [{ "type": "text", "text": "BAK-20260701-0001" }] }]
  }
}
```

---

## 5. Out For Delivery Template

- **Name:** `bakery_out_for_delivery`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID, `{{2}}` = estimated arrival time

```json
{
  "name": "bakery_out_for_delivery",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "🚚 Order *{{1}}* is out for delivery! Expected by {{2}}.",
      "example": { "body_text": [["BAK-20260701-0001", "6:30 PM"]] }
    }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_out_for_delivery",
    "language": { "code": "en" },
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "BAK-20260701-0001" }, { "type": "text", "text": "6:30 PM" }] }
    ]
  }
}
```

---

## 6. Ready For Pickup Template

- **Name:** `bakery_ready_for_pickup`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID, `{{2}}` = bakery address

```json
{
  "name": "bakery_ready_for_pickup",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "📦 Order *{{1}}* is ready for pickup at {{2}}. See you soon!",
      "example": { "body_text": [["BAK-20260701-0001", "123 Main Street, Rameswaram"]] }
    }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_ready_for_pickup",
    "language": { "code": "en" },
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "BAK-20260701-0001" }, { "type": "text", "text": "123 Main Street, Rameswaram" }] }
    ]
  }
}
```

---

## 7. Order Delivered Template

- **Name:** `bakery_order_delivered`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID

```json
{
  "name": "bakery_order_delivered",
  "category": "UTILITY",
  "language": "en",
  "components": [
    { "type": "BODY", "text": "🎉 Order *{{1}}* has been delivered. Thank you for choosing us — enjoy!", "example": { "body_text": [["BAK-20260701-0001"]] } }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_order_delivered",
    "language": { "code": "en" },
    "components": [{ "type": "body", "parameters": [{ "type": "text", "text": "BAK-20260701-0001" }] }]
  }
}
```

---

## 8. Order Cancelled Template

- **Name:** `bakery_order_cancelled`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID, `{{2}}` = reason

```json
{
  "name": "bakery_order_cancelled",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "❌ Order *{{1}}* has been cancelled. Reason: {{2}}. Contact us if you have questions.",
      "example": { "body_text": [["BAK-20260701-0001", "Item out of stock"]] }
    }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_order_cancelled",
    "language": { "code": "en" },
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "BAK-20260701-0001" }, { "type": "text", "text": "Item out of stock" }] }
    ]
  }
}
```

---

## 9. Payment Reminder Template

- **Name:** `bakery_payment_reminder`
- **Category:** UTILITY
- **Language:** en
- **Variables:** `{{1}}` = order ID, `{{2}}` = amount due

```json
{
  "name": "bakery_payment_reminder",
  "category": "UTILITY",
  "language": "en",
  "components": [
    {
      "type": "BODY",
      "text": "💳 Friendly reminder: ₹{{2}} is pending for order *{{1}}*. Reply here if you'd like to pay via UPI.",
      "example": { "body_text": [["BAK-20260701-0001", "715"]] }
    }
  ]
}
```

**API Payload:**
```json
{
  "messaging_product": "whatsapp",
  "to": "919999999999",
  "type": "template",
  "template": {
    "name": "bakery_payment_reminder",
    "language": { "code": "en" },
    "components": [
      { "type": "body", "parameters": [{ "type": "text", "text": "BAK-20260701-0001" }, { "type": "text", "text": "715" }] }
    ]
  }
}
```

---

## Notes on categories

- **MARKETING** templates (like Welcome) can only be sent to customers who've opted in,
  and are subject to Meta's marketing template pricing/limits.
- **UTILITY** templates (order status updates) are transactional — tied to an existing
  order — and have looser sending restrictions since they're not promotional.
- All templates above use only `BODY` variables for simplicity. You can optionally add a
  `HEADER` (text or image) and `FOOTER` component in Meta's template builder if you want
  a logo/banner or a fixed footer line — the JSON structure just gets an extra object in
  the `components` array.

## Approval turnaround

Meta typically reviews templates within a few minutes to 24 hours. Templates get
rejected if the `{{n}}` placeholders don't match the `example` values in count, or if the
wording resembles content Meta restricts (e.g. certain financial/medical claims) — none of
the templates above should trigger that, but always check **WhatsApp Manager → Message
Templates** for the exact rejection reason if one occurs.
