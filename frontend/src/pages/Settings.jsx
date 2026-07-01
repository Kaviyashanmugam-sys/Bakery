import React, { useEffect, useState } from "react";
import api from "../services/api";
import Spinner from "../components/Spinner.jsx";

export default function Settings() {
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
        bakeryName: form.bakeryName,
        bakeryPhone: form.bakeryPhone,
        bakeryAddress: form.bakeryAddress,
        gstPercentage: form.gstPercentage,
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
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Settings</h2>
      <p className="text-sm text-crust-600/70 mb-6">General bakery information used across the bot and reports.</p>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm max-w-lg space-y-4">
        {saved && <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-2 rounded-lg">Settings saved.</div>}
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Bakery Name</label>
          <input value={form.bakeryName || ""} onChange={(e) => setForm({ ...form, bakeryName: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Phone Number</label>
          <input value={form.bakeryPhone || ""} onChange={(e) => setForm({ ...form, bakeryPhone: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">Address</label>
          <textarea value={form.bakeryAddress || ""} onChange={(e) => setForm({ ...form, bakeryAddress: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-crust-700 mb-1">GST Percentage</label>
          <input type="number" value={form.gstPercentage ?? 0} onChange={(e) => setForm({ ...form, gstPercentage: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
        </div>
        <button type="submit" disabled={saving} className="bg-crust-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-crust-600 disabled:opacity-60">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
