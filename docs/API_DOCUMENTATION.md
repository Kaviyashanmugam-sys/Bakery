# API Documentation

Base URL (local): `http://localhost:5000`
All admin endpoints require `Authorization: Bearer <token>` from `/api/auth/login`, unless marked **Public**.

---

## Auth

### `POST /api/auth/login`
**Public.** Body: `{ "email": "admin@bakery.com", "password": "Admin@123" }`
Response: `{ success, token, user: { id, name, email, role } }`

### `GET /api/auth/me`
Returns the currently logged-in admin's profile.

---

## Webhook (Meta Cloud API)

### `GET /webhook`
**Public.** Meta's one-time verification handshake. Query params: `hub.mode`, `hub.verify_token`, `hub.challenge`. Returns the challenge string if `hub.verify_token` matches `WHATSAPP_VERIFY_TOKEN`.

### `POST /webhook`
**Public.** Meta posts every inbound message and status event here. Always responds `200` immediately, then processes asynchronously through `conversationService.handleIncomingMessage()`. Every inbound message is also logged to `WhatsAppLog`.

---

## Flow Endpoint (Meta WhatsApp Flow)

### `POST /api/flow-endpoint`
**Public** (authenticated via RSA/AES encryption, not a bearer token). Receives `{ encrypted_flow_data, encrypted_aes_key, initial_vector }`, decrypts, routes to the right business-logic branch in `flowController.js` based on the decrypted `action`/`data.trigger`, and returns an encrypted response. See `meta-flow/FLOW_EXPLAINED.md` for the full request/response cycle.

---

## Orders (admin)

### `GET /api/orders`
Query params: `status`, `fulfillmentType`, `search`, `from`, `to`, `page`, `limit`.
Response: `{ success, count, total, page, totalPages, data: Order[] }`

### `GET /api/orders/:id`
`:id` is the human-readable `orderId` (e.g. `BAK-20260701-0001`), not the Mongo `_id`.

### `PATCH /api/orders/:id/status`
Body: `{ "status": "preparing" }`. Valid values: `pending, confirmed, preparing, ready, out_for_delivery, completed, cancelled`. Automatically sends a WhatsApp status-update message to the customer.

### `PATCH /api/orders/:id/payment-status`
Body: `{ "paymentStatus": "paid" }`.

---

## Products / Categories / Customers (admin)

Standard REST CRUD, all under `/api/products`, `/api/categories`, `/api/customers`:
- `GET /` — list (supports `search`, `category`, `isAvailable` query params on products)
- `GET /:id` — single record
- `POST /` — create
- `PUT /:id` — update
- `DELETE /:id` — delete (categories block delete if products still reference them)
- `PATCH /api/customers/:id/toggle-block` — block/unblock a customer

---

## Payments

### `POST /api/payments`
Body: `{ "orderId": "BAK-...", "amount": 715, "method": "upi", "status": "paid", "transactionRef": "..." }`
Creates a `Payment` record and, if `status: "paid"`, marks the related order's `paymentStatus` as paid.

### `GET /api/payments?orderId=`
Lists payments, optionally filtered by order.

---

## Templates

### `POST /api/templates/send`
Body: `{ "templateKey": "orderPreparing", "to": "919999999999", "params": { "orderId": "BAK-..." }, "relatedOrderId": "BAK-..." }`
`templateKey` matches a function name in `services/templateService.js` (`welcome`, `orderReceived`, `orderConfirmation`, `orderPreparing`, `outForDelivery`, `readyForPickup`, `orderDelivered`, `orderCancelled`, `paymentReminder`). See `docs/TEMPLATES.md` for each template's required `params`.

### `GET /api/templates/logs`
Lists sent templates from `TemplateLog`, newest first.

---

## Dashboard

### `GET /api/dashboard/summary`
Returns `{ totalOrders, todaysOrders, pendingOrders, completedOrders, cancelledOrders, totalCustomers, totalRevenue, todaysRevenue }`.

### `GET /api/dashboard/sales-trend?days=14`
Returns a day-by-day array of `{ _id: "2026-07-01", orders, revenue }` for charting.

---

## Reports

### `GET /api/reports/orders/excel?from=&to=&status=`
Streams an `.xlsx` file of matching orders.

### `GET /api/reports/orders/pdf?from=&to=&status=`
Streams a `.pdf` file of matching orders (landscape table).

For daily/weekly/monthly reports, the frontend Reports page just sets `from`/`to` to the
appropriate range (today, last 7 days, last 30 days) before calling these same endpoints.

---

## WhatsApp Logs

### `GET /api/whatsapp-logs?phone=&direction=&page=&limit=`
Every inbound/outbound message (not templates — see `/api/templates/logs` for those).

---

## Settings

### `GET /api/settings`
Returns the singleton settings document (creates a default one on first call).

### `PUT /api/settings`
Superadmin only. Partial update — send only the fields you're changing. Powers the
Settings, Meta Configuration, and Flow Builder Configuration admin pages.

---

## Public API (no auth — for a future storefront, or manual testing)

### `GET /api/public/categories`
### `GET /api/public/products?category=`
### `GET /api/public/order-status/:orderId`
### `POST /api/public/orders`
Body: `{ customerName, customerPhone, items: [{ name, price, quantity }], fulfillmentType, deliveryAddress, preferredDate, preferredTime, paymentMethod }`

---

## Error format

All errors follow: `{ "success": false, "message": "..." }` with an appropriate HTTP status
(400 validation, 401/403 auth, 404 not found, 409 conflict, 500 server error).
