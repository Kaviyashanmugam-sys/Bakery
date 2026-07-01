import React, { useEffect, useState } from "react";
import api from "../services/api";
import Spinner from "../components/Spinner.jsx";

export default function MetaConfiguration() {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/settings").then(({ data }) => {
      setForm(data.data);
      setLoading(false);
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const { data } = await api.put("/settings", {
        whatsappPhoneNumberId: form.whatsappPhoneNumberId,
        whatsappBusinessAccountId: form.whatsappBusinessAccountId,
        whatsappApiVersion: form.whatsappApiVersion,
      });
      setForm(data.data);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <Spinner />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Meta Configuration</h2>
      <p className="text-sm text-crust-600/70 mb-6">
        Non-secret WhatsApp Cloud API identifiers. Your access token and app secret always stay in the
        backend's <code className="bg-crust-100 px-1 rounded">.env</code> file — never entered here.
      </p>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm max-w-lg space-y-4">
        {saved && <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg">Configuration saved.</div>}
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Phone Number ID</label>
          <input value={form.whatsappPhoneNumberId || ""} onChange={(e) => setForm({ ...form, whatsappPhoneNumberId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm font-mono" placeholder="e.g. 1208355402355410" />
        </div>
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">WhatsApp Business Account ID (WABA)</label>
          <input value={form.whatsappBusinessAccountId || ""} onChange={(e) => setForm({ ...form, whatsappBusinessAccountId: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm font-mono" placeholder="e.g. 1010240645024252" />
        </div>
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">API Version</label>
          <input value={form.whatsappApiVersion || ""} onChange={(e) => setForm({ ...form, whatsappApiVersion: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm font-mono" placeholder="v20.0" />
        </div>
        <button type="submit" disabled={saving} className="bg-crust-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crust-600 disabled:opacity-60">
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </form>

      <div className="mt-6 bg-white rounded-xl border border-crust-100 p-6 shadow-sm max-w-lg">
        <h3 className="font-semibold text-crust-800 mb-2 text-sm">Webhook Setup Checklist</h3>
        <ol className="text-sm text-crust-600/80 space-y-1.5 list-decimal list-inside">
          <li>Meta App Dashboard → WhatsApp → Configuration</li>
          <li>Callback URL: <code className="bg-crust-100 px-1 rounded">https://your-domain.com/webhook</code></li>
          <li>Verify Token: matches <code className="bg-crust-100 px-1 rounded">WHATSAPP_VERIFY_TOKEN</code> in .env</li>
          <li>Subscribe to the <code className="bg-crust-100 px-1 rounded">messages</code> field</li>
        </ol>
      </div>
    </div>
  );
}
