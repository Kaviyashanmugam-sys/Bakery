import React, { useState } from "react";
import { FileDown, FileSpreadsheet } from "lucide-react";
import api from "../services/api";

function toISODate(d) {
  return d.toISOString().slice(0, 10);
}

export default function Reports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);

  function applyPreset(period) {
    const now = new Date();
    let start = new Date(now);
    if (period === "daily") {
      // today only
    } else if (period === "weekly") {
      start.setDate(now.getDate() - 7);
    } else if (period === "monthly") {
      start.setMonth(now.getMonth() - 1);
    }
    setFrom(toISODate(start));
    setTo(toISODate(now));
  }

  async function handleExport(type) {
    setDownloading(true);
    try {
      const params = {};
      if (from) params.from = from;
      if (to) params.to = to;
      if (status) params.status = status;

      const response = await api.get(`/reports/orders/${type}`, {
        params,
        responseType: "blob",
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders_report_${Date.now()}.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Reports</h2>
      <p className="text-sm text-crust-600/70 mb-6">Filter and export order data for accounting or review.</p>

      <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm max-w-xl">
        <div className="flex gap-2 mb-4">
          <button onClick={() => applyPreset("daily")} className="px-3 py-1.5 rounded-lg text-xs border border-crust-100 hover:bg-crust-50">Today</button>
          <button onClick={() => applyPreset("weekly")} className="px-3 py-1.5 rounded-lg text-xs border border-crust-100 hover:bg-crust-50">Last 7 Days</button>
          <button onClick={() => applyPreset("monthly")} className="px-3 py-1.5 rounded-lg text-xs border border-crust-100 hover:bg-crust-50">Last 30 Days</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-crust-700 mb-1">From Date</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-crust-700 mb-1">To Date</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm" />
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-crust-700 mb-1">Status (optional)</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-crust-100 text-sm">
            <option value="">All Statuses</option>
            {["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"].map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            disabled={downloading}
            onClick={() => handleExport("excel")}
            className="flex items-center gap-2 flex-1 justify-center bg-emerald-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </button>
          <button
            disabled={downloading}
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-2 flex-1 justify-center bg-berry-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-berry-500 disabled:opacity-60"
          >
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
