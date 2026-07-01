# WhatsApp Bakery Chatbot 🍰

A complete WhatsApp ordering chatbot for bakeries, built with React, Node.js/Express, MongoDB, and the WhatsApp Cloud API.

## Project Structure

```
whatsapp-bakery-bot/
├── backend/          Node.js + Express + MongoDB API + WhatsApp webhook + Flow endpoint
├── frontend/          React admin dashboard (Vite + Tailwind)
├── meta-flow/         Complete Meta WhatsApp Flow JSON + line-by-line explanation
└── docs/              API docs, template specs, architecture, deployment guide
```

## What's Included

- **Two ordering paths** (switchable from the dashboard): simple interactive
  list/button messages, or a full multi-screen **Meta Flow** (`meta-flow/bakery-order-flow.json`)
- **9 Meta message templates**, fully specified in `docs/TEMPLATES.md` (JSON, API payload, sample response)
- **Admin dashboard**: orders, products, categories, customers, dashboard stats + revenue
  chart, PDF/Excel reports (daily/weekly/monthly presets), WhatsApp logs, Settings,
  Meta Configuration, Flow Builder Configuration
- **MongoDB collections**: Customers, Products, Categories, Orders, Payments, AdminUsers,
  Sessions, FlowSessions, WhatsAppLogs, TemplateLogs, WebhookLogs, Settings
- **Full documentation**: see `docs/API_DOCUMENTATION.md`, `docs/ARCHITECTURE.md`,
  `docs/DEPLOYMENT.md`, and `meta-flow/FLOW_EXPLAINED.md`

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB)
- A Meta developer account with a WhatsApp Business app set up (Phone Number ID, permanent access token, WABA ID)

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGO_URI` — your MongoDB Atlas connection string
- `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_BUSINESS_ACCOUNT_ID` — from Meta App Dashboard → WhatsApp → API Setup
- `WHATSAPP_VERIFY_TOKEN` — any string you choose; you'll enter this same value in Meta's webhook config
- `JWT_SECRET` — a long random string
- `BAKERY_NAME`, `BAKERY_PHONE`, `BAKERY_ADDRESS`, `GST_PERCENTAGE` — your bakery's details

Seed the database with sample categories, products, and the first admin login:

```bash
npm run seed
```

This creates an admin user using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env` (default `admin@bakery.com` / `Admin@123` — **change this password after first login**).

Start the server:

```bash
npm run dev
```

The API runs on `http://localhost:5000`.

## 3. Connecting the WhatsApp Webhook

1. Deploy the backend somewhere public (Render, Railway, etc.) or use `ngrok http 5000` for local testing.
2. In Meta App Dashboard → WhatsApp → Configuration, set:
   - **Callback URL**: `https://<your-domain>/webhook`
   - **Verify Token**: same value as `WHATSAPP_VERIFY_TOKEN` in your `.env`
3. Subscribe to the `messages` webhook field.
4. Send "Hi" to your WhatsApp Business number to test the bot.

## 4. Frontend Setup (Admin Dashboard)

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` in `.env` to your backend's `/api` URL (e.g. `http://localhost:5000/api`).

```bash
npm run dev
```

Visit `http://localhost:5173`, log in with the seeded admin credentials.

## 5. Deployment Notes

- **Backend**: deploy to Render/Railway as a Node web service. Set all `.env` variables in the platform's environment settings. Make sure the webhook URL uses HTTPS (required by Meta).
- **Frontend**: deploy to Vercel/Netlify/Render Static Site. Set `VITE_API_URL` to your deployed backend URL.
- **MongoDB**: use MongoDB Atlas; whitelist your backend's IP (or `0.0.0.0/0` for platforms with dynamic IPs like Render).

## 6. Customer Conversation Flow

```
Hi
 └─ Main Menu (1-5)
    ├─ 1. Place an Order
    │   └─ Name → Mobile → Category → Product → Quantity → (Add more?) 
    │      → Cart Review → Pickup/Delivery → (Address) → Date & Time
    │      → Payment Method → Order Summary → Confirm → Saved to MongoDB
    │      → WhatsApp confirmation with Order ID sent
    ├─ 2. View Menu → Browse categories/products (no ordering)
    ├─ 3. Today's Special → Lists featured items
    ├─ 4. Order Status → Enter Order ID → Get current status
    └─ 5. Contact Us → Address, phone, hours
```

Type `cancel` at any point during ordering to reset and start over.

## 7. Extending

- Add Razorpay/UPI deep-link payment collection in `services/whatsappService.js` + `conversationService.js`.
- Add WhatsApp Flows for a richer cart/checkout UI instead of list messages.
- Add image support for products (send `type: image` messages with product photos).
- Add role-based staff accounts via `AdminUser.role` (`superadmin` vs `staff`) using the `requireRole` middleware.

## 8. Using the Meta Flow instead

By default the bot uses interactive list/button messages. To switch to the full
multi-screen Meta Flow experience, follow the Flow setup steps in
`docs/DEPLOYMENT.md` (section 5), then toggle **Ordering Mode** to "Meta Flow" from
the admin dashboard's Flow Builder Configuration page.

---

Built with Node.js, Express, MongoDB, React, Tailwind CSS, and the WhatsApp Cloud API.
