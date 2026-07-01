import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../services/api";
import StatusBadge from "../components/StatusBadge.jsx";
import Spinner from "../components/Spinner.jsx";

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "out_for_delivery", "completed", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      await load();
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Spinner />;
  if (!order) return <p className="text-crust-600/70">Order not found.</p>;

  return (
    <div>
      <Link to="/orders" className="inline-flex items-center gap-1 text-sm text-crust-600/70 hover:text-crust-800 mb-4">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-crust-800">{order.orderId}</h2>
          <p className="text-sm text-crust-600/70">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm">
            <h3 className="font-semibold text-crust-800 mb-3">Items</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-crust-600/70 text-xs uppercase">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx} className="border-t border-crust-50">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">₹{item.price}</td>
                    <td className="py-2">{item.quantity}</td>
                    <td className="py-2 text-right">₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-crust-100 mt-3 pt-3 text-sm space-y-1 text-right">
              <p>Subtotal: ₹{order.itemsTotal}</p>
              {order.gstAmount > 0 && <p>GST ({order.gstPercentage}%): ₹{order.gstAmount}</p>}
              <p className="font-semibold text-base">Total: ₹{order.totalAmount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm">
            <h3 className="font-semibold text-crust-800 mb-3">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button
                  key={s}
                  disabled={updating || order.status === s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize border transition-colors ${
                    order.status === s
                      ? "bg-crust-800 text-white border-crust-800"
                      : "border-crust-100 text-crust-700 hover:bg-crust-50"
                  } disabled:opacity-60`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            <p className="text-xs text-crust-600/60 mt-3">
              Changing status automatically sends a WhatsApp notification to the customer.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm">
            <h3 className="font-semibold text-crust-800 mb-3">Customer</h3>
            <p className="text-sm">{order.customerName}</p>
            <p className="text-sm text-crust-600/70">{order.customerPhone}</p>
          </div>

          <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm">
            <h3 className="font-semibold text-crust-800 mb-3">Fulfillment</h3>
            <p className="text-sm capitalize">{order.fulfillmentType}</p>
            {order.fulfillmentType === "delivery" && order.deliveryAddress?.line1 && (
              <p className="text-sm text-crust-600/70 mt-1">{order.deliveryAddress.line1}</p>
            )}
            <p className="text-sm text-crust-600/70 mt-1">
              {order.preferredDate} at {order.preferredTime}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm">
            <h3 className="font-semibold text-crust-800 mb-3">Payment</h3>
            <p className="text-sm capitalize">{order.paymentMethod}</p>
            <div className="mt-1">
              <StatusBadge status={order.paymentStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
