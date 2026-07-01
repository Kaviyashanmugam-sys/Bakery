import React from "react";

export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-crust-600/70 gap-2">
      <div className="w-5 h-5 border-2 border-crust-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
