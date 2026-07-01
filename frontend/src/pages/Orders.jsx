import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge.jsx";
import Spinner from "../components/Spinner.jsx";

const STATUS_OPTIONS = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = { page, limit: 15 };
        if (search) params.search = search;
        if (status) params.status = status;
        const { data } = await api.get("/orders", { params });
        setOrders(data.data);
        setTotalPages(data.totalPages);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(load, 300); // debounce search
    return () => clearTimeout(timer);
  }, [search, status, page]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Orders</h2>
      <p className="text-sm text-crust-600/70 mb-6">View and manage all customer orders.</p>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-crust-600/50" />
          <input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search by Order ID, name, or phone..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-crust-100 text-sm focus:outline-none focus:ring-2 focus:ring-crust-400"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="px-3 py-2 rounded-lg border border-crust-100 text-sm focus:outline-none focus:ring-2 focus:ring-crust-400"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-crust-100 shadow-sm overflow-hidden">
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <p className="text-center py-16 text-sm text-crust-600/60">No orders found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-crust-50 text-left text-crust-600/70 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-t border-crust-50 hover:bg-crust-50/60">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.orderId}`} className="text-berry-600 font-medium hover:underline">
                      {o.orderId}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.customerName}</div>
                    <div className="text-xs text-crust-600/60">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3">{o.items.length} item(s)</td>
                  <td className="px-4 py-3 font-medium">₹{o.totalAmount}</td>
                  <td className="px-4 py-3 capitalize">{o.fulfillmentType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-4 py-3 text-crust-600/70">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm ${
                p === page ? "bg-crust-800 text-white" : "bg-white border border-crust-100 text-crust-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
