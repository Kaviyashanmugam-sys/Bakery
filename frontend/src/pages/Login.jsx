import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Croissant } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-crust-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-crust-800 text-crust-50 mb-4">
            <Croissant size={28} />
          </div>
          <h1 className="text-2xl font-semibold text-crust-800">Sweet Crust Bakery</h1>
          <p className="text-sm text-crust-600/70 mt-1">Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-crust-100 p-6 shadow-sm space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg border border-red-100">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-crust-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-crust-100 focus:outline-none focus:ring-2 focus:ring-crust-400"
              placeholder="admin@bakery.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-crust-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-crust-100 focus:outline-none focus:ring-2 focus:ring-crust-400"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-crust-800 text-white py-2.5 rounded-lg font-medium hover:bg-crust-600 transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
