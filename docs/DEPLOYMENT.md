# Deployment Guide

## 1. MongoDB Atlas

1. Create a free/shared cluster at cloud.mongodb.com.
2. Database Access → add a user with a strong password.
3. Network Access → add `0.0.0.0/0` (or your host's static IP if available) so Render/Railway can connect.
4. Copy the connection string into `MONGO_URI`.

## 2. Backend — Render (or Railway)

1. Push `backend/` to a Git repo (or the whole monorepo — Render lets you set a root directory).
2. New → Web Service → connect the repo, set **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add every variable from `.env.example` under Environment → Environment Variables.
   - For `FLOW_PRIVATE_KEY`, paste the PEM with literal `\n` for line breaks (Render's
     env var editor stores it as a single-line string).
5. Deploy. Note the public URL, e.g. `https://bakery-bot-api.onrender.com`.
6. Run the seed script once via Render's Shell tab: `npm run seed`.

## 3. Frontend — Vercel (or Netlify / Render Static Site)

1. New Project → import the repo → set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Environment variable: `VITE_API_URL=https://bakery-bot-api.onrender.com/api`.
4. Deploy. Log in with your seeded admin credentials.

## 4. Meta App Configuration

1. developers.facebook.com → your app → WhatsApp → API Setup: note the **Phone Number ID**
   and generate a **permanent access token** (System User token, not the 24-hour temporary one).
2. WhatsApp → Configuration → Webhook:
   - Callback URL: `https://bakery-bot-api.onrender.com/webhook`
   - Verify Token: same value as `WHATSAPP_VERIFY_TOKEN`
   - Subscribe to the `messages` field.
3. WhatsApp Manager → Message Templates → create each of the 9 templates from
   `docs/TEMPLATES.md`, submit for review, wait for approval (usually minutes to 24h).

## 5. Meta Flow Setup (only if using `meta_flow` ordering mode)

1. Generate an RSA key pair:
   ```bash
   openssl genrsa -out private.pem 2048
   openssl rsa -in private.pem -pubout -out public.pem
   ```
2. WhatsApp Manager → Flows → Create Flow → paste in `meta-flow/bakery-order-flow.json`
   (or use "Import" if your account has that option).
3. In the Flow's Endpoint settings: paste `public.pem`'s contents, and set the endpoint URI
   to `https://bakery-bot-api.onrender.com/api/flow-endpoint`.
4. Copy `private.pem`'s contents into the backend's `FLOW_PRIVATE_KEY` env var (with `\n`
   for line breaks) and redeploy.
5. Note the Flow's ID (shown in WhatsApp Manager) and enter it in the admin dashboard under
   **Flow Builder Config**, then switch **Ordering Mode** to "Meta Flow".
6. Use Flow Builder's **Preview** to test screen-by-screen before publishing.
7. Publish the Flow once it's working end to end.

## 6. Post-deployment checklist

- [ ] Send "Hi" to your WhatsApp Business number — confirm the main menu appears
- [ ] Place a full test order end-to-end, confirm it appears in the admin dashboard
- [ ] Change an order's status from the dashboard — confirm the customer gets a WhatsApp message
- [ ] Export a PDF and Excel report — confirm both download correctly
- [ ] If using Meta Flow: complete a test order through the Flow, confirm the order lands in MongoDB
- [ ] Rotate the seeded admin password from **Settings**
