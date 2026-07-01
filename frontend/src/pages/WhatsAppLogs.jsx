import React, { useEffect, useState } from "react";
import api from "../services/api";
import Spinner from "../components/Spinner.jsx";

export default function WhatsAppLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = direction ? { direction } : {};
        const { data } = await api.get("/whatsapp-logs", { params });
        setLogs(data.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [direction]);

  return (
    <div>
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">WhatsApp Notification Logs</h2>
      <p className="text-sm text-crust-600/70 mb-6">A record of every message sent to and received from customers.</p>

      <select value={direction} onChange={(e) => setDirection(e.target.value)} className="mb-4 px-3 py-2 rounded-lg border border-crust-100 text-sm">
        <option value="">All Messages</option>
        <option value="outbound">Sent by Bot</option>
        <option value="inbound">Received from Customer</option>
      </select>

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-xl border border-crust-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-crust-50 text-left text-crust-600/70 text-xs uppercase tracking-wide">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Direction</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t border-crust-50 hover:bg-crust-50/60">
                  <td className="px-4 py-3 text-crust-600/70 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">{log.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.direction === "outbound" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {log.direction === "outbound" ? "Sent" : "Received"}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-md truncate">{log.messageContent}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === "sent" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {log.status}
                    </span>
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
