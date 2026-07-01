import React, { useEffect, useState } from "react";
import api from "../services/api";
import Spinner from "../components/Spinner.jsx";

export default function FlowBuilderConfiguration() {
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
        flowId: form.flowId,
        flowVersion: form.flowVersion,
        flowEndpointUri: form.flowEndpointUri,
        orderingMode: form.orderingMode,
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
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Flow Builder Configuration</h2>
      <p className="text-sm text-crust-600/70 mb-6">
        Choose whether "Place an Order" uses simple interactive messages or the full Meta Flow.
      </p>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm max-w-lg space-y-4">
        {saved && <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg">Configuration saved.</div>}

        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Ordering Mode</label>
          <select
            value={form.orderingMode}
            onChange={(e) => setForm({ ...form, orderingMode: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm"
          >
            <option value="interactive_messages">Interactive Messages (lists & buttons)</option>
            <option value="meta_flow">Meta Flow (multi-screen form)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Flow ID</label>
          <input
            value={form.flowId || ""}
            onChange={(e) => setForm({ ...form, flowId: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm font-mono"
            placeholder="From WhatsApp Manager → Flows"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Flow JSON Version</label>
          <input
            value={form.flowVersion || ""}
            onChange={(e) => setForm({ ...form, flowVersion: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm font-mono"
            placeholder="6.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Flow Endpoint URI</label>
          <input
            value={form.flowEndpointUri || ""}
            onChange={(e) => setForm({ ...form, flowEndpointUri: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm font-mono"
            placeholder="https://your-domain.com/api/flow-endpoint"
          />
        </div>

        <button type="submit" disabled={saving} className="bg-crust-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crust-600 disabled:opacity-60">
          {saving ? "Saving..." : "Save Configuration"}
        </button>
      </form>

      <div className="mt-6 bg-white rounded-xl border border-crust-100 p-6 shadow-sm max-w-lg">
        <h3 className="font-semibold text-crust-800 mb-2 text-sm">Setup Checklist</h3>
        <ol className="text-sm text-crust-600/80 space-y-1.5 list-decimal list-inside">
          <li>Generate an RSA key pair: <code className="bg-crust-100 px-1 rounded">openssl genrsa -out private.pem 2048</code></li>
          <li>Upload the public key in WhatsApp Manager → Flows → your flow → Endpoint</li>
          <li>Put the private key in the backend's <code className="bg-crust-100 px-1 rounded">FLOW_PRIVATE_KEY</code> env var</li>
          <li>Import <code className="bg-crust-100 px-1 rounded">meta-flow/bakery-order-flow.json</code> into Flow Builder</li>
          <li>Set this page's Flow Endpoint URI to your deployed <code className="bg-crust-100 px-1 rounded">/api/flow-endpoint</code></li>
          <li>Switch Ordering Mode to "Meta Flow" above once tested</li>
        </ol>
      </div>
    </div>
  );
}
