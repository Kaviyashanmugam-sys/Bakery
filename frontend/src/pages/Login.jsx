import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Croissant } from "lucide-react";

// Self-contained welcome animation: a chef walks in, places a laddu on the
// plate (which already has a few sweets resting on it), gives a little wave,
// then the scene resets. Pure CSS keyframes + inline SVG — no dependencies.
function LaddooDelivery() {
  return (
    <div className="w-full h-40 overflow-hidden rounded-2xl bg-gradient-to-b from-crust-50 to-crust-100 mb-6">
      <style>{`
        .laddoo-ground { stroke: #C99A5B; stroke-width: 2; opacity: 0.5; }

        .laddoo-walker { animation: laddoo-walk-cycle 6.5s ease-in-out infinite; }
        @keyframes laddoo-walk-cycle {
          0%   { transform: translateX(-100px); opacity: 1; }
          40%  { transform: translateX(255px); opacity: 1; }
          45%  { transform: translateX(255px); opacity: 1; }
          80%  { transform: translateX(255px); opacity: 1; }
          93%  { transform: translateX(255px); opacity: 0; }
          100% { transform: translateX(-100px); opacity: 0; }
        }

        .laddoo-leg-back, .laddoo-shoe-back { transform-box: fill-box; transform-origin: 50% 0%; animation: laddoo-swing-back 6.5s ease-in-out infinite; }
        .laddoo-leg-front, .laddoo-shoe-front { transform-box: fill-box; transform-origin: 50% 0%; animation: laddoo-swing-front 6.5s ease-in-out infinite; }
        @keyframes laddoo-swing-back {
          0%   { transform: rotate(-28deg); }
          7%   { transform: rotate(28deg); }
          14%  { transform: rotate(-28deg); }
          21%  { transform: rotate(28deg); }
          28%  { transform: rotate(-28deg); }
          35%  { transform: rotate(10deg); }
          40%  { transform: rotate(0deg); }
          45%,100% { transform: rotate(0deg); }
        }
        @keyframes laddoo-swing-front {
          0%   { transform: rotate(28deg); }
          7%   { transform: rotate(-28deg); }
          14%  { transform: rotate(28deg); }
          21%  { transform: rotate(-28deg); }
          28%  { transform: rotate(28deg); }
          35%  { transform: rotate(-10deg); }
          40%  { transform: rotate(0deg); }
          45%,100% { transform: rotate(0deg); }
        }

        .laddoo-arm-back { transform-box: fill-box; transform-origin: 50% 0%; animation: laddoo-swing-front 6.5s ease-in-out infinite; }

        .laddoo-body-bob {
          animation: laddoo-bob 6.5s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 50% 100%;
        }
        @keyframes laddoo-bob {
          0%   { transform: translateY(0) rotate(0deg); }
          7%   { transform: translateY(-4px) rotate(1.5deg); }
          14%  { transform: translateY(0) rotate(0deg); }
          21%  { transform: translateY(-4px) rotate(-1.5deg); }
          28%  { transform: translateY(0) rotate(0deg); }
          35%  { transform: translateY(-2px) rotate(0deg); }
          40%,45% { transform: translateY(0) rotate(0deg); }
          48%  { transform: translateY(-6px); }
          52%  { transform: translateY(0); }
          100% { transform: translateY(0); }
        }

        .laddoo-arm-carry {
          transform-box: fill-box;
          transform-origin: 0% 0%;
          animation: laddoo-arm-carry-move 6.5s ease-in-out infinite;
        }
        @keyframes laddoo-arm-carry-move {
          0%,40%  { transform: rotate(-8deg); }
          46%     { transform: rotate(-32deg); }
          52%     { transform: rotate(-8deg); }
          58%     { transform: rotate(10deg); }
          62%     { transform: rotate(-6deg); }
          66%     { transform: rotate(10deg); }
          70%,100%{ transform: rotate(-8deg); }
        }

        .laddoo-eye-blink { animation: laddoo-blink 6.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes laddoo-blink {
          0%,36%,38%,100% { transform: scaleY(1); }
          37% { transform: scaleY(0.1); }
        }

        .laddoo-mustache { animation: laddoo-twitch 6.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        @keyframes laddoo-twitch {
          0%,55%,100% { transform: translateY(0); }
          57% { transform: translateY(-1px); }
          59% { transform: translateY(0); }
        }

        .laddoo-sweet-carried { animation: laddoo-sweet-journey 6.5s ease-in-out infinite; }
        @keyframes laddoo-sweet-journey {
          0%   { transform: translate(-58px, 4px) scale(1); opacity: 1; }
          40%  { transform: translate(285px, 4px) scale(1); opacity: 1; }
          45%  { transform: translate(295px, 2px) scale(1); opacity: 1; }
          48%  { transform: translate(300px, 18px) scale(0.94); opacity: 1; }
          92%  { transform: translate(300px, 18px) scale(0.94); opacity: 1; }
          100% { transform: translate(300px, 18px) scale(0.94); opacity: 0; }
        }
        .laddoo-shine { animation: laddoo-shine-kf 6.5s ease-in-out infinite; }
        @keyframes laddoo-shine-kf {
          0%,46% { opacity: 0; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1); }
          56% { opacity: 0; transform: scale(1.3); }
          100% { opacity: 0; }
        }

        .laddoo-resting { animation: laddoo-idle-sit 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .laddoo-resting.d2 { animation-delay: 0.6s; }
        .laddoo-resting.d3 { animation-delay: 1.1s; }
        @keyframes laddoo-idle-sit {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-1.5px); }
        }

        .laddoo-steam { opacity: 0; animation: laddoo-rise 3.4s ease-in infinite; }
        .laddoo-steam.s2 { animation-delay: 1.1s; }
        .laddoo-steam.s3 { animation-delay: 2.1s; }
        @keyframes laddoo-rise {
          0%   { opacity: 0; transform: translateY(0) scaleX(1); }
          15%  { opacity: 0.55; }
          70%  { opacity: 0.25; }
          100% { opacity: 0; transform: translateY(-22px) scaleX(1.4); }
        }

        @media (prefers-reduced-motion: reduce) {
          .laddoo-walker, .laddoo-leg-back, .laddoo-leg-front, .laddoo-shoe-back, .laddoo-shoe-front,
          .laddoo-body-bob, .laddoo-arm-carry, .laddoo-arm-back, .laddoo-sweet-carried, .laddoo-shine,
          .laddoo-resting, .laddoo-steam, .laddoo-eye-blink, .laddoo-mustache { animation: none !important; }
        }
      `}</style>

      <svg viewBox="0 0 500 210" width="100%" height="100%">
        <line className="laddoo-ground" x1="10" y1="176" x2="490" y2="176" />

        {/* Table + plate */}
        <g>
          <rect x="358" y="158" width="6" height="18" fill="#C99A5B" />
          <rect x="396" y="158" width="6" height="18" fill="#C99A5B" />
          <ellipse cx="380" cy="158" rx="48" ry="9" fill="#F3E9D8" stroke="#A9713A" strokeWidth="2" />
          <ellipse cx="380" cy="153" rx="36" ry="7.5" fill="#FFFFFF" stroke="#C99A5B" strokeWidth="1.5" />
        </g>

        {/* Sweets already resting on the plate, with gentle steam */}
        <g className="laddoo-steam" transform="translate(362,140)">
          <path d="M0 0 Q -3 -6 0 -10 Q 3 -14 0 -18" stroke="#EEDFC6" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
        <g className="laddoo-resting" transform="translate(362,148)">
          <circle r="10" fill="#E8A64D"/>
          <circle cx="-2" cy="-3" r="1.3" fill="#C97C1F"/>
          <circle cx="3" cy="-1" r="1.3" fill="#C97C1F"/>
          <circle cx="0" cy="3" r="1.3" fill="#C97C1F"/>
          <path d="M -2 -10 Q 0 -14 2 -10" stroke="#7A9A5A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </g>

        <g className="laddoo-steam s2" transform="translate(395,138)">
          <path d="M0 0 Q -3 -6 0 -10 Q 3 -14 0 -18" stroke="#EEDFC6" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
        <g className="laddoo-resting d2" transform="translate(395,147)">
          <circle r="10" fill="#EDAF57"/>
          <circle cx="-2" cy="-3" r="1.3" fill="#C97C1F"/>
          <circle cx="3" cy="-1" r="1.3" fill="#C97C1F"/>
          <circle cx="0" cy="3" r="1.3" fill="#C97C1F"/>
          <path d="M -2 -10 Q 0 -14 2 -10" stroke="#7A9A5A" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        </g>

        <g className="laddoo-steam s3" transform="translate(378,133)">
          <path d="M0 0 Q -3 -6 0 -10 Q 3 -14 0 -18" stroke="#EEDFC6" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
        <g className="laddoo-resting d3" transform="translate(378,140)">
          <circle r="9.5" fill="#E8A64D"/>
          <circle cx="-2" cy="-3" r="1.2" fill="#C97C1F"/>
          <circle cx="2" cy="-1" r="1.2" fill="#C97C1F"/>
          <circle cx="0" cy="3" r="1.2" fill="#C97C1F"/>
          <path d="M -2 -9 Q 0 -13 2 -9" stroke="#7A9A5A" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
        </g>

        {/* Carried sweet: independent so it can leave the hand and land on the plate */}
        <g className="laddoo-sweet-carried">
          <circle r="11" fill="#E8A64D"/>
          <circle cx="-3" cy="-4" r="1.4" fill="#C97C1F"/>
          <circle cx="3" cy="-2" r="1.4" fill="#C97C1F"/>
          <circle cx="0" cy="3" r="1.4" fill="#C97C1F"/>
          <circle cx="-4" cy="4" r="1.2" fill="#C97C1F"/>
          <circle cx="4" cy="4" r="1.2" fill="#C97C1F"/>
          <path d="M -2 -11 Q 0 -16 2 -11" stroke="#7A9A5A" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </g>
        <g className="laddoo-shine" transform="translate(300,22)">
          <path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z" fill="#F6D57A" />
        </g>

        {/* Walker */}
        <g className="laddoo-walker">
          <g className="laddoo-body-bob">
            <rect className="laddoo-leg-back" x="-15" y="122" width="10" height="34" rx="4" fill="#3E4C59"/>
            <ellipse className="laddoo-shoe-back" cx="-10" cy="158" rx="9" ry="4.5" fill="#2A2F35"/>

            <rect className="laddoo-leg-front" x="5" y="122" width="10" height="34" rx="4" fill="#4A5A6A"/>
            <ellipse className="laddoo-shoe-front" cx="10" cy="158" rx="9" ry="4.5" fill="#2A2F35"/>

            <path d="M -18 92 Q -18 118 -14 124 L 14 124 Q 18 118 18 92 Q 18 84 0 84 Q -18 84 -18 92 Z" fill="#B23A48"/>
            <path d="M -11 96 L 11 96 L 8 122 L -8 122 Z" fill="#F3E9D8" stroke="#C99A5B" strokeWidth="1.2"/>
            <path d="M -11 96 L -16 88 M 11 96 L 16 88" stroke="#C99A5B" strokeWidth="2" fill="none" strokeLinecap="round"/>

            <rect className="laddoo-arm-back" x="-22" y="90" width="8" height="24" rx="4" fill="#96222F"/>

            <rect x="-5" y="70" width="10" height="10" fill="#E8B98A"/>
            <circle cx="0" cy="62" r="15" fill="#F0C79A"/>

            <circle cx="-14" cy="63" r="3" fill="#E8B98A"/>
            <circle cx="14" cy="63" r="3" fill="#E8B98A"/>

            <path d="M -15 58 Q -16 44 0 43 Q 16 44 15 58 Q 15 50 0 50 Q -15 50 -15 58 Z" fill="#2A2118"/>

            <g className="laddoo-eye-blink" transform="translate(-6,61)"><ellipse rx="1.6" ry="2" fill="#2A2118"/></g>
            <g className="laddoo-eye-blink" transform="translate(6,61)"><ellipse rx="1.6" ry="2" fill="#2A2118"/></g>
            <g className="laddoo-mustache">
              <path d="M -8 68 Q 0 71 8 68 Q 4 73 0 71 Q -4 73 -8 68 Z" fill="#2A2118"/>
            </g>
            <path d="M -3 74 Q 0 76 3 74" stroke="#8A5A3A" strokeWidth="1.3" fill="none" strokeLinecap="round"/>

            <path d="M -15 47 Q -17 30 0 28 Q 17 30 15 47 Q 15 40 0 40 Q -15 40 -15 47 Z" fill="#FFFFFF" stroke="#C99A5B" strokeWidth="1.3"/>
            <rect x="-16" y="46" width="32" height="5" rx="2.5" fill="#FFFFFF" stroke="#C99A5B" strokeWidth="1.3"/>

            <g className="laddoo-arm-carry" transform="translate(16,92)">
              <rect x="0" y="0" width="8" height="24" rx="4" fill="#96222F"/>
              <circle cx="4" cy="26" r="5" fill="#E8B98A"/>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

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
        <LaddooDelivery />

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
