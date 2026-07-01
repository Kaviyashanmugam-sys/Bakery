import React, { useEffect, useState } from "react";
import { ShoppingBag, CalendarClock, Clock, CheckCircle2, XCircle, IndianRupee } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import api from "../services/api";
import StatCard from "../components/StatCard.jsx";
import Spinner from "../components/Spinner.jsx";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, trendRes] = await Promise.all([
          api.get("/dashboard/summary"),
          api.get("/dashboard/sales-trend?days=14"),
        ]);
        setSummary(summaryRes.data.data);
        setTrend(trendRes.data.data.map((d) => ({ date: d._id.slice(5), revenue: d.revenue, orders: d.orders })));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner label="Loading dashboard..." />;

  return (
    <div>
      <h2 className="text-2xl font-semibold text-crust-800 mb-1">Dashboard</h2>
      <p className="text-sm text-crust-600/70 mb-6">Overview of your bakery's orders and revenue.</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders" value={summary.totalOrders} icon={ShoppingBag} accent="crust" />
        <StatCard label="Today's Orders" value={summary.todaysOrders} icon={CalendarClock} accent="amber" />
        <StatCard label="Pending Orders" value={summary.pendingOrders} icon={Clock} accent="amber" />
        <StatCard label="Completed Orders" value={summary.completedOrders} icon={CheckCircle2} accent="green" />
        <StatCard label="Cancelled Orders" value={summary.cancelledOrders} icon={XCircle} accent="red" />
        <StatCard label="Total Revenue" value={`₹${summary.totalRevenue.toLocaleString()}`} icon={IndianRupee} accent="berry" />
        <StatCard label="Today's Revenue" value={`₹${summary.todaysRevenue.toLocaleString()}`} icon={IndianRupee} accent="berry" />
        <StatCard label="Total Customers" value={summary.totalCustomers} icon={ShoppingBag} accent="crust" />
      </div>

      <div className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-crust-800 mb-4">Revenue — Last 14 Days</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3E9D8" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#A9713A" />
            <YAxis tick={{ fontSize: 12 }} stroke="#A9713A" />
            <Tooltip formatter={(v) => `₹${v}`} />
            <Line type="monotone" dataKey="revenue" stroke="#B23A48" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
