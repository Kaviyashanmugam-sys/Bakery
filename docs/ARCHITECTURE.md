# Architecture — Every Folder, Every File

```
whatsapp-bakery-bot/
├── backend/
├── frontend/
├── meta-flow/
└── docs/
```

## `backend/`

### `server.js`
The entry point. Loads env vars, connects to MongoDB, wires up all middleware
(helmet, cors, json parsing, morgan logging) and all route modules, starts listening.

### `config/db.js`
Connects Mongoose to MongoDB Atlas using `MONGO_URI`. Exits the process on failure —
the app can't run without a database.

### `models/` — one file per MongoDB collection
| File | Purpose |
|---|---|
| `Customer.js` | Every phone number that's messaged the bot; tracks order count/spend |
| `Category.js` | Menu categories (Cakes, Puffs, etc.), emoji + display order |
| `Product.js` | Individual menu items, price, category ref, availability |
| `Order.js` | The core order record — items, totals, fulfillment, payment, status history |
| `Payment.js` | Payment records against an order (cash/UPI/card, paid/pending) |
| `AdminUser.js` | Dashboard login accounts, bcrypt-hashed passwords, role (`superadmin`/`staff`) |
| `Session.js` | Conversation state for the **text-based** (list/button) ordering flow |
| `FlowSession.js` | Conversation state for the **Meta Flow** ordering flow — keyed by `flow_token` |
| `WhatsAppLog.js` | Every inbound/outbound plain message, for the WhatsApp Logs admin page |
| `TemplateLog.js` | Every approved-template message sent, separate from WhatsAppLog |
| `WebhookLog.js` | Raw, unparsed payload of every call Meta makes to `/webhook` and `/api/flow-endpoint` |
| `Setting.js` | Singleton document holding bakery info + Meta/Flow configuration |

### `services/` — business logic, reusable across controllers
| File | Purpose |
|---|---|
| `whatsappService.js` | Sends text/button/list/flow messages via the Cloud API; logs every send |
| `templateService.js` | Sends approved templates by name; one wrapper function per template |
| `conversationService.js` | The state machine driving the **text-based** ordering flow, step by step |
| `sessionService.js` | Get/update/reset a customer's `Session` document |
| `flowEncryption.js` | RSA+AES decrypt/encrypt for the Meta Flow data endpoint |

### `controllers/` — one per resource, called by routes
`authController`, `categoryController`, `productController`, `customerController`,
`orderController`, `dashboardController`, `reportController` (PDF/Excel export),
`whatsappLogController`, `paymentController`, `settingController`, `templateController`,
`publicController` (unauthenticated customer-facing endpoints), `webhookController`
(parses Meta's inbound payload, hands off to `conversationService`), `flowController`
(decrypts Meta Flow calls, runs ordering logic, encrypts the response).

### `routes/` — thin Express routers, one per controller, mounted in `server.js`

### `middleware/`
- `auth.js` — `protect` (verifies JWT), `requireRole` (restricts to e.g. `superadmin`)
- `errorHandler.js` — `asyncHandler` wrapper + centralized error formatting
- `validate.js` — `express-validator` chains for products/categories/login

### `utils/`
- `logger.js` — Winston logger (console + file), used everywhere instead of `console.log`
- `generateOrderId.js` — builds `BAK-YYYYMMDD-####` order IDs
- `seedData.js` — populates categories/products/first admin user (`npm run seed`)

---

## `frontend/`

Vite + React + Tailwind admin dashboard.

- `src/main.jsx` — mounts `<App />` inside `BrowserRouter` + `AuthProvider`
- `src/App.jsx` — all routes; `ProtectedRoute` redirects to `/login` if not authenticated
- `src/context/AuthContext.jsx` — login/logout, stores JWT in `localStorage`
- `src/services/api.js` — axios instance, auto-attaches the JWT, auto-logs-out on 401
- `src/components/` — `Layout` (sidebar nav), `Modal`, `Spinner`, `StatCard`, `StatusBadge`
- `src/pages/` — one file per dashboard page (Dashboard, Orders, OrderDetail, Products,
  Categories, Customers, Reports, WhatsAppLogs, Settings, MetaConfiguration,
  FlowBuilderConfiguration, Login)

---

## `meta-flow/`

- `bakery-order-flow.json` — the complete, importable Meta Flow definition (10 screens)
- `FLOW_EXPLAINED.md` — every section of that JSON explained in plain language, since
  JSON itself can't contain comments

---

## `docs/`

- `API_DOCUMENTATION.md` — every endpoint, request/response shape
- `TEMPLATES.md` — all 9 Meta template definitions with JSON, payload, sample response
- `ARCHITECTURE.md` — this file
- `DEPLOYMENT.md` — step-by-step production deployment

---

## How the two ordering paths relate

This project ships **two** ways to take an order, controlled by `Setting.orderingMode`:

1. **Interactive Messages** (`conversationService.js` + `Session` model) — simpler, no
   RSA key setup, works immediately. List/button messages step the customer through
   category → product → quantity → cart → checkout.
2. **Meta Flow** (`flowController.js` + `FlowSession` model) — a native multi-screen form
   inside WhatsApp, defined by `meta-flow/bakery-order-flow.json`. Requires generating an
   RSA key pair and configuring the Flow in Meta Business Manager first.

Both paths write to the same `Order` collection and trigger the same confirmation message,
so the rest of the system (admin dashboard, reports, status updates) doesn't need to know
or care which one a given order came from.
