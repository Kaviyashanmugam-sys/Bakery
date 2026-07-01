import React from "react";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 bg-crust-800/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-crust-100">
          <h3 className="font-semibold text-crust-800">{title}</h3>
          <button onClick={onClose} className="text-crust-600/60 hover:text-crust-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
