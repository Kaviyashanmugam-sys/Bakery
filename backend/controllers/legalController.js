// Meta requires publicly-visible Privacy Policy and Terms of Service URLs
// before an app can go Live or pass App Review. These are simple server-rendered
// HTML pages — no React needed — so they work even before the frontend is deployed.

const BAKERY_NAME = process.env.BAKERY_NAME || "Sweet Crust Bakery";
const BAKERY_PHONE = process.env.BAKERY_PHONE || "+91 00000 00000";

function pageWrapper(title, bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — ${BAKERY_NAME}</title>
  <style>
    body { font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 20px; line-height: 1.6; color: #3a2415; }
    h1 { color: #6B4423; }
    h2 { color: #A9713A; margin-top: 28px; }
    a { color: #B23A48; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
}

function getPrivacyPolicy(req, res) {
  res.send(
    pageWrapper(
      "Privacy Policy",
      `
    <h1>Privacy Policy</h1>
    <p>Last updated: ${new Date().toDateString()}</p>
    <p>${BAKERY_NAME} ("we", "us") operates a WhatsApp ordering service. This policy explains what
    information we collect and how we use it.</p>

    <h2>Information We Collect</h2>
    <p>When you message us on WhatsApp or place an order, we collect: your name, phone number,
    delivery address (if applicable), and order details (items, quantities, payment method).</p>

    <h2>How We Use Your Information</h2>
    <p>We use this information solely to process and fulfill your orders, send order status updates
    via WhatsApp, and improve our service. We do not sell your information to third parties.</p>

    <h2>Data Storage</h2>
    <p>Order and contact information is stored securely in our database and retained only as long as
    necessary for order fulfillment and business records.</p>

    <h2>WhatsApp Business Platform</h2>
    <p>This service uses the WhatsApp Business Platform (Meta). Your interactions are also subject to
    <a href="https://www.whatsapp.com/legal/business-policy/" target="_blank">WhatsApp's Business Policy</a>.</p>

    <h2>Contact Us</h2>
    <p>For questions about this policy or to request deletion of your data, contact us at ${BAKERY_PHONE}.</p>
    `
    )
  );
}

function getTermsOfService(req, res) {
  res.send(
    pageWrapper(
      "Terms of Service",
      `
    <h1>Terms of Service</h1>
    <p>Last updated: ${new Date().toDateString()}</p>
    <p>By placing an order with ${BAKERY_NAME} through WhatsApp, you agree to the following terms.</p>

    <h2>Orders</h2>
    <p>All orders are subject to availability. Prices shown at the time of ordering are final unless
    otherwise communicated. Order confirmation is sent via WhatsApp once your order is placed.</p>

    <h2>Payment</h2>
    <p>We accept Cash, UPI, and Card payments as selected during checkout. Payment for delivery orders
    is due at the time of delivery unless prepaid.</p>

    <h2>Cancellations</h2>
    <p>Orders may be cancelled by contacting us directly before preparation begins. Once an order is
    marked "Preparing," cancellation may not be possible.</p>

    <h2>Delivery & Pickup</h2>
    <p>Delivery times are estimates and may vary. Pickup orders must be collected within a reasonable
    time of the "Ready" notification.</p>

    <h2>Changes to These Terms</h2>
    <p>We may update these terms from time to time. Continued use of our WhatsApp ordering service
    constitutes acceptance of any changes.</p>

    <h2>Contact Us</h2>
    <p>For any questions, contact us at ${BAKERY_PHONE}.</p>
    `
    )
  );
}

module.exports = { getPrivacyPolicy, getTermsOfService };