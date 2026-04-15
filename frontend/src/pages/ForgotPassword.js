import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendOTP, resetPassword } from "../services/otpServices";

const OTP_TIME = 90;

const inputClass =
  "w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg " +
  "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all";

const STEPS = ["Email", "Verify OTP", "New password"];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center mb-6">
    {STEPS.map((label, i) => {
      const stepNum = i + 1;
      const done    = currentStep > stepNum;
      const active  = currentStep === stepNum;
      return (
        <React.Fragment key={stepNum}>
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all"
              style={{
                background: done ? "#E1F5EE" : active ? "#185FA5" : "#f3f4f6",
                color:      done ? "#0F6E56" : active ? "white"   : "#9ca3af",
                border:     done || active ? "none" : "0.5px solid #e5e7eb",
              }}>
              {done ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : stepNum}
            </div>
            <span className="text-xs mt-1"
              style={{ color: active ? "#185FA5" : "#9ca3af", fontWeight: active ? 500 : 400 }}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-px mb-4 transition-all"
              style={{ background: done ? "#5DCAA5" : "#e5e7eb" }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep]               = useState(1);
  const [email, setEmail]             = useState("");
  const [otp, setOtp]                 = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);
  const [timer, setTimer]             = useState(OTP_TIME);
  const [canResend, setCanResend]     = useState(false);

  useEffect(() => {
    if (step !== 2 || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    if (timer === 0) setCanResend(true);
  }, [timer]);

  /* Step 1 — Send OTP */
  const handleSendOtp = async () => {
    setError("");
    if (!email.match(/\S+@\S+\.\S+/)) { setError("Please enter a valid email address"); return; }
    setLoading(true);
    try {
      const res = await sendOTP(email);
      if (res.success) {
        setStep(2);
        setTimer(OTP_TIME);
        setCanResend(false);
      } else {
        setError(res.message || "Failed to send OTP. Check your email and try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Resend OTP */
  const handleResend = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await sendOTP(email);
      if (res.success) {
        setTimer(OTP_TIME);
        setCanResend(false);
        setOtp("");
      } else {
        setError(res.message);
      }
    } catch {
      setError("Failed to resend.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 2 — Verify OTP (just check length; backend verifies on reset) */
  const handleVerifyOtp = () => {
    setError("");
    if (otp.length < 6) { setError("Please enter the 6-digit OTP"); return; }
    setStep(3);
  };

  /* Step 3 — Reset password */
  const handleReset = async () => {
    setError("");
    if (newPassword.length < 6)           { setError("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPwd)        { setError("Passwords do not match"); return; }

    setLoading(true);
    try {
      const res = await resetPassword(email, otp, newPassword);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(res.message || "Reset failed. Please try again.");
        // If OTP wrong, go back to step 2
        if (res.message?.toLowerCase().includes("otp") || res.message?.toLowerCase().includes("expired")) {
          setStep(2);
          setOtp("");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "linear-gradient(135deg, #173404 0%, #27500A 55%, #3B6D11 100%)" }}>
        <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "#E1F5EE" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-800 mb-2">Password reset!</p>
          <p className="text-sm text-gray-500">Redirecting to sign in...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 50%, #185FA5 100%)" }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl border border-gray-100">

        {/* Brand */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#185FA5" }}>
            <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" fill="white" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm leading-tight">Ticket Counter</p>
            <p className="text-xs text-gray-400">Reset your password</p>
          </div>
        </div>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* ── Step 1: Email ── */}
        {step === 1 && (
          <div>
            <p className="text-xs text-gray-500 mb-4">
              Enter your registered email. We'll send a 6-digit OTP to reset your password.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  className={inputClass} />
              </div>
            </div>
            <button onClick={handleSendOtp} disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#185FA5" }}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 2 && (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              OTP sent to <span className="font-medium text-blue-600">{email}</span>.{" "}
              <button onClick={() => { setStep(1); setOtp(""); }} className="text-gray-400 underline">
                Change
              </button>
            </p>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Enter OTP</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <input type="text" placeholder="123456" maxLength={6} value={otp}
                    onChange={(e) => { setOtp(e.target.value); setError(""); }}
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 tracking-widest" />
                </div>
                {canResend && (
                  <button onClick={handleResend} disabled={loading}
                    className="px-3 py-2 text-xs font-medium rounded-lg border"
                    style={{ borderColor: "#185FA5", color: "#185FA5" }}>
                    Resend
                  </button>
                )}
              </div>
              {!canResend && (
                <p className="text-xs mt-1.5" style={{ color: "#854F0B" }}>
                  Resend in {timer}s
                </p>
              )}
            </div>

            <button onClick={handleVerifyOtp} disabled={otp.length < 6}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#0F6E56" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verify OTP
            </button>
          </div>
        )}

        {/* ── Step 3: New password ── */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg" style={{ background: "#E1F5EE" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" className="w-3.5 h-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs font-medium" style={{ color: "#0F6E56" }}>OTP verified for {email}</span>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">New password</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input type="password" placeholder="Min. 6 characters" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                  className={inputClass} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm new password</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input type="password" placeholder="Re-enter password" value={confirmPwd}
                  onChange={(e) => { setConfirmPwd(e.target.value); setError(""); }}
                  className={inputClass} />
              </div>
              {newPassword && confirmPwd && newPassword !== confirmPwd && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button onClick={handleReset} disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#3B6D11" }}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              )}
              {loading ? "Resetting..." : "Reset password"}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 mt-5 pt-4 text-center">
          <button onClick={() => navigate("/login")}
            className="text-xs text-blue-600 hover:underline">
            Back to sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;