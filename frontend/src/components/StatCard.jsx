import React from "react";

export default function StatCard({ label, value, icon: Icon, accent = "crust" }) {
  const accentClasses = {
    crust: "bg-crust-100 text-crust-700",
    berry: "bg-berry-500/10 text-berry-600",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white rounded-xl border border-crust-100 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-crust-600/70 font-medium">{label}</p>
          <p className="text-2xl font-semibold text-crust-800 mt-1">{value}</p>
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-lg ${accentClasses[accent]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
