import React, { useEffect, useState } from "react";
import { Search, Ban, CheckCircle } from "lucide-react";
import api from "../services/api";
import Spinner from "../components/Spinner.jsx";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = search ? { search } : {};
      const { data } = await api.get("/customers", { params });
      setCustomers(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function toggleBlock(c) {
    await api.patch(`/customers/${c._id}/toggle-block`);
    load();
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Customers</h2>
      <p className="text-sm text-crust-600/70 mb-6">Everyone who has messaged or ordered through WhatsApp.</p>

      <div className="relative mb-4 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-crust-600/50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or phone..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-crust-100 text-sm"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl border border-crust-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-crust-50 text-left text-crust-600/70 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3">Total Spent</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id} className="border-t border-crust-50 hover:bg-crust-50/60">
                  <td className="px-4 py-3 font-medium">{c.name || "—"}</td>
                  <td className="px-4 py-3">{c.phone}</td>
                  <td className="px-4 py-3">{c.totalOrders}</td>
                  <td className="px-4 py-3">₹{c.totalSpent}</td>
                  <td className="px-4 py-3">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${c.isBlocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {c.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleBlock(c)}
                      className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border ${
                        c.isBlocked ? "border-emerald-100 text-emerald-700 hover:bg-emerald-50" : "border-red-100 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      {c.isBlocked ? <CheckCircle size={13} /> : <Ban size={13} />}
                      {c.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
