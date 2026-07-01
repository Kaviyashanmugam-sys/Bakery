# Meta Flow — Explained

File: `meta-flow/bakery-order-flow.json`

This is a **dynamic** Flow — every screen except the static text ones asks our backend
for its content via `data_exchange`, rather than hardcoding categories/products into the
JSON. That's necessary because your menu lives in MongoDB and changes over time.

JSON itself doesn't support comments, so this file explains every section of the Flow
JSON in plain language, screen by screen.

---

## Top-level properties

```json
"version": "6.0"
```
The Flow JSON schema version Meta's Flow Builder expects. Meta updates this periodically —
check **WhatsApp Manager → Flows → Create Flow → JSON** for the current supported version
before importing; if Meta's builder rejects it, bump this number to match and re-validate.

```json
"data_api_version": "3.0"
```
The version of the request/response contract used when WhatsApp calls your Flow endpoint
(`POST /api/flow-endpoint` in this project). Must match what your endpoint code expects.

```json
"routing_model": { "WELCOME": ["CATEGORY_SELECTION"], ... }
```
A graph of which screen can navigate to which. Meta validates your Flow against this at
import time — if a screen's `on-click-action` targets a screen not listed here as a valid
"next," the import is rejected. Notice `CART` can go to either `DELIVERY_PICKUP` (checkout)
or back to `CATEGORY_SELECTION` (add another item) — that's the "Add another item" loop.
`DELIVERY_PICKUP` can go to either `ADDRESS` (if delivery) or straight to `PAYMENT`
(if pickup) — our backend decides which at runtime (see "Dynamic routing" below).

```json
"screens": [ ... ]
```
The ordered list of every screen in the Flow. Order in the array doesn't matter for
navigation (routing_model controls that) — it's just how Flow Builder lists them.

---

## Per-screen anatomy

Every screen has:
- `id` — unique screen identifier, referenced in routing_model and navigation actions.
- `title` — shown in the WhatsApp Flow header bar.
- `terminal` — `true` only for the last screen (`SUCCESS`); marks where the Flow can end.
- `data` — the schema of dynamic values this screen expects to receive (filled in by our
  backend's `data_exchange` response). Declaring `type` here lets Flow Builder validate
  your backend's responses match what the screen can render.
- `layout.children` — the actual visual components on the screen, top to bottom.

### Screen 1 — WELCOME
Static intro. The `Footer` button's `on-click-action` is `data_exchange` with
`payload.trigger = "get_categories"` — this calls our backend, which responds with the
`CATEGORY_SELECTION` screen's data (the live category list from MongoDB).

### Screen 2 — CATEGORY_SELECTION
`RadioButtonsGroup` with `data-source: "${data.categories}"` — the `${...}` syntax pulls
from whatever the backend sent in its `data_exchange` response. The customer picks one;
tapping "Next" sends `category_id: "${form.selected_category}"` back to our backend
(`${form.*}` reads the value the customer selected in this screen's form).

### Screen 3 — PRODUCTS
Same pattern as categories, but scoped to the chosen category. `description` is used to
show the price next to each product name in the radio list.

### Screen 4 — QUANTITY
A `TextInput` with `input-type: "number"`. Flow's built-in validation is limited (mainly
`required`), so real bounds-checking (1–50, integer) happens server-side in our
`data_exchange` handler — if invalid, the backend returns an `error_message` and Flow
Builder re-shows the same screen with that message instead of advancing.

### Screen 5 — CART
Shows a pre-formatted cart summary string built server-side (`cart_summary`) rather than
a repeating component, since Flow's static components can't easily loop over a cart array
with computed subtotals — string formatting is the simpler, well-supported approach.
`EmbeddedLink` gives a secondary action (add more items) alongside the primary `Footer`
button (checkout) — a screen can only have one Footer but can have multiple `EmbeddedLink`s.

### Screen 6 — DELIVERY_PICKUP
Static `RadioButtonsGroup` (pickup vs delivery — these options never change, so they're
hardcoded in the JSON instead of fetched from the backend).

**Dynamic routing note:** when the backend receives `trigger: "set_fulfillment"`, if
`fulfillment_type === "pickup"` it returns `{"screen": "PAYMENT", ...}` in its response,
skipping the address screen entirely — even though `ADDRESS` is listed as a possible next
screen in routing_model, the backend chooses at runtime which of the allowed options to
actually send back.

### Screen 7 — ADDRESS
Only reached when delivery was chosen. `pincode` uses `input-type: "number"`; a stricter
6-digit check happens server-side.

### Screen 8 — PAYMENT
Combines date/time scheduling and payment method into one screen to match the 10-screen
structure requested. `DatePicker` gives a native date picker; `preferred_time` is free text
since Flow has no dedicated time-picker component.

### Screen 9 — CONFIRMATION
Read-only summary (`order_summary`, `total_amount`) built server-side from everything
collected so far. Tapping "Confirm Order" sends `trigger: "place_order"` — this is the
point where our backend actually writes the `Order` document to MongoDB and generates
the Order ID.

### Screen 10 — SUCCESS
`terminal: true, success: true` marks this as the Flow's valid ending point. The Footer's
`on-click-action.name` is `"complete"` (not `data_exchange`) — this is the special action
that closes the Flow and hands control back to the WhatsApp chat thread, passing
`order_id` back to Meta as the Flow's final response payload (visible in your webhook as
the `nfm_reply` message).

---

## Components reference (what we used and why)

| Component | Used for | Notes |
|---|---|---|
| `TextHeading` / `TextSubheading` / `TextBody` | Titles and paragraph text | Not interactive |
| `RadioButtonsGroup` | Category, product, fulfillment, payment method | Single choice, supports both static and dynamic `data-source` |
| `TextInput` | Name-like fields, quantity, address, time | `input-type` can be `text`, `number`, `email`, `password` |
| `DatePicker` | Preferred date | Renders a native calendar picker |
| `EmbeddedLink` | Secondary actions ("add another item") | Can't be the primary submit action |
| `Footer` | Primary screen action (Next / Confirm / Done) | Exactly one per screen |
| `Form` | Wraps inputs so their values are collected into `${form.*}` | Required around any screen with input components |

## Validation strategy

Flow Builder's client-side validation is intentionally minimal (mostly `required: true`).
Real validation — quantity bounds, pincode format, non-empty cart — happens in our
`flowController.js` `data_exchange` handler: if something's invalid, the response includes
an `error_message` field instead of advancing to the next screen, and Flow Builder displays
it inline on the current screen automatically.
