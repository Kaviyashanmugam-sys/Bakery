import React from "react";

const styles = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-indigo-100 text-indigo-700",
  ready: "bg-teal-100 text-teal-700",
  out_for_delivery: "bg-purple-100 text-purple-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
};

export default function StatusBadge({ status }) {
  const label = status?.replace(/_/g, " ");
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[status] || "bg-gray-100 text-gray-700"}`}>
      {label}
    </span>
  );
}
