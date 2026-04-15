import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP } from "../services/otpServices";
import useAuth from "../hooks/useAuth";                // ← ADDED

const inputClass =
  "w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg " +
  "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

const Login = () => {
  const navigate      = useNavigate();
  const { login }     = useAuth();                    // ← ADDED

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [otp, setOtp]                   = useState("");
  const [useOtp, setUseOtp]             = useState(false);
  const [otpSent, setOtpSent]           = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [selectedMode, setSelectedMode] = useState("bus");

  /* ── Password login ── */
  const handlePasswordLogin = async () => {
    setError("");
    if (!email || !password) { setError("Email and password are required"); return; }
    setLoading(true);
    try {
      const res  = await fetch("http://localhost:5000/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.token, data.user);    // ← FIXED: was localStorage.setItem (doesn't update React state)
        navigate("/dashboard");          // ← FIXED: removed window.location.reload()
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Send OTP ── */
  const handleSendOtp = async () => {
    setError("");
    if (!email) { setError("Please enter your email first"); return; }
    setLoading(true);
    try {
      const res = await sendOTP(email);
      if (res.success) {
        setOtpSent(true);
      } else {
        setError(res.message || "Failed to send OTP.");
      }
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP login ── */
  const handleOtpLogin = async () => {
    setError("");
    if (!otp) { setError("Please enter the OTP"); return; }
    setLoading(true);
    try {
      // ← FIXED: was loginWithOTP from otpServices which doesn't return JWT token
      const res  = await fetch("http://localhost:5000/api/auth/login-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.token, data.user);    // ← FIXED: was localStorage.setItem
        navigate("/dashboard");          // ← FIXED: removed window.location.reload()
      } else {
        setError(data.message || "Invalid OTP. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setUseOtp(!useOtp);
    setOtpSent(false);
    setError("");
    setOtp("");
  };

  const transportModes = [
    {
      id: "bus", label: "Bus",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <line x1="9.5" y1="13.5" x2="14.5" y2="13.5" />
        </svg>
      ),
    },
    {
      id: "train", label: "Train",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <path d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
          <path d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
          <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
        </svg>
      ),
    },
    {
      id: "flight", label: "Flight",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 50%, #185FA5 100%)" }}
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border border-gray-100">

        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#185FA5" }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" fill="white" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm leading-tight">Ticket Counter</p>
            <p className="text-xs text-gray-400">Buses · Trains · Flights</p>
          </div>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button onClick={() => useOtp && switchMode()}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${!useOtp ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            Password
          </button>
          <button onClick={() => !useOtp && switchMode()}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${useOtp ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            OTP login
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
          <div className="relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
        </div>

        {!useOtp && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
            <div className="relative">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input type="password" placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                className={inputClass} />
            </div>
          </div>
        )}

        {useOtp && otpSent && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">One-time password</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <input type="text" placeholder="123456" maxLength={6} value={otp}
                  onChange={(e) => setOtp(e.target.value)} className={inputClass} />
              </div>
              <button onClick={handleSendOtp}
                className="px-3 py-2 text-xs font-medium border rounded-lg"
                style={{ borderColor: "#185FA5", color: "#185FA5" }}>
                Resend
              </button>
            </div>
            <p className="text-xs mt-1.5" style={{ color: "#0F6E56" }}>✓ OTP sent to {email}</p>
          </div>
        )}

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {!useOtp ? (
          <button onClick={handlePasswordLogin} disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
            style={{ background: "#185FA5" }}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        ) : !otpSent ? (
          <button onClick={handleSendOtp} disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white mt-1 disabled:opacity-60"
            style={{ background: "#185FA5" }}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        ) : (
          <button onClick={handleOtpLogin} disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-white mt-1 disabled:opacity-60"
            style={{ background: "#0F6E56" }}>
            {loading ? "Verifying..." : "Verify & sign in"}
          </button>
        )}

        <div className="border-t border-gray-100 my-5" />

        <div className="flex justify-center gap-3 flex-wrap">
          {transportModes.map((mode) => (
            <button key={mode.id} onClick={() => setSelectedMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                selectedMode === mode.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-gray-200 text-gray-500"
              }`}>
              {mode.icon}{mode.label}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-5 mt-5">
          <button onClick={() => navigate("/forgot-password")} className="text-xs text-blue-600 hover:underline">
            Forgot password?
          </button>
          <button onClick={() => navigate("/register")} className="text-xs text-blue-600 hover:underline">
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;