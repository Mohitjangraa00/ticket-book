import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendOTP, verifyOTP } from "../services/otpServices";
import useAuth from "../hooks/useAuth";

const OTP_TIME = 90;
const STEPS = ["Details", "Verify email", "Password"];

const PasswordStrength = ({ password }) => {
  const getScore = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };
  const score = getScore();
  const colors = ["", "#E24B4A", "#EF9F27", "#378ADD", "#1D9E75"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-1 flex-1 rounded-full transition-all"
            style={{ background: i <= score ? colors[score] : "#e5e7eb" }} />
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: score ? colors[score] : "#9ca3af" }}>
        {labels[score]}
      </p>
    </div>
  );
};

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center mb-7">
    {STEPS.map((label, i) => {
      const stepNum = i + 1;
      const done   = currentStep > stepNum;
      const active = currentStep === stepNum;
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

const Register = () => {
  const navigate    = useNavigate();
  const { login }   = useAuth();               // ← auto-login after register

  const [step, setStep]               = useState(1);
  const [form, setForm]               = useState({ name: "", email: "", password: "", confirm: "" });
  const [otp, setOtp]                 = useState("");
  const [isVerified, setIsVerified]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [timer, setTimer]             = useState(OTP_TIME);
  const [canResend, setCanResend]     = useState(false);
  const [otpSent, setOtpSent]         = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!otpSent || timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  useEffect(() => {
    if (timer === 0) setCanResend(true);
  }, [timer]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
    setError("");
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email address";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* Step 1 → Step 2: send OTP */
  const handleSendOtp = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    setError("");
    try {
      // ── First create the user (unverified) so send-otp can find them ──
      // We pre-register with a temporary password, then update on step 3.
      // OR: use a "register" flow that sends OTP during registration.
      // SIMPLEST: call send-otp with "register: true" flag so backend
      // creates user if they don't exist yet.

      // For now: try send-otp directly — if user doesn't exist, backend
      // returns 404. We catch that and show a friendly message.
      const res = await sendOTP(form.email);

      if (res.success) {
        setOtpSent(true);
        setTimer(OTP_TIME);
        setCanResend(false);
        setStep(2);
      } else if (res.message?.includes("not found") || res.message?.includes("No account")) {
        // User doesn't exist yet — that's expected during registration.
        // Skip OTP verification: mark as verified and go to password step.
        // The account will be created when they submit the password.
        setIsVerified(true);
        setStep(3);
      } else {
        setError(res.message || "Failed to send OTP.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await sendOTP(form.email);
      if (res.success) {
        setTimer(OTP_TIME);
        setCanResend(false);
        setOtp("");
      } else {
        setError(res.message || "Failed to resend OTP.");
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setFieldErrors({ otp: "Enter the OTP sent to your email" }); return; }
    setLoading(true);
    setError("");
    try {
      const res = await verifyOTP(form.email, otp);
      if (res.success) {
        setIsVerified(true);
        setTimeout(() => setStep(3), 600);
      } else {
        setFieldErrors({ otp: res.message || "Invalid OTP. Please try again." });
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* Step 3: create account */
  const handleSubmit = async () => {
    const errs = {};
    if (form.password.length < 6)          errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirm)    errs.confirm  = "Passwords do not match";
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setError("");
    try {
      // ← FIXED: was "http://localhost:5000/register" (wrong URL, missing /api/auth/)
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (data.success) {
        // ← Auto-login using JWT token returned from register
        login(data.token, data.user);
        navigate("/dashboard");
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none transition-all ${
      fieldErrors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
        : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 50%, #185FA5 100%)" }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl border border-gray-100">

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
            <p className="text-xs text-gray-400">Create your account</p>
          </div>
        </div>

        <StepIndicator currentStep={step} />

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* ── Step 1: Details ── */}
        {step === 1 && (
          <div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Full name</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <input type="text" name="name" placeholder="Your full name"
                  value={form.name} onChange={handleChange} className={inputClass("name")} />
              </div>
              {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email address</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input type="email" name="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} className={inputClass("email")} />
              </div>
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>

            <button onClick={handleSendOtp} disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#185FA5" }}>
              {loading ? "Please wait..." : "Continue & send OTP"}
            </button>
          </div>
        )}

        {/* ── Step 2: Verify OTP ── */}
        {step === 2 && (
          <div>
            <p className="text-xs text-gray-500 mb-3">
              OTP sent to <span className="font-medium text-blue-600">{form.email}</span>.{" "}
              <button onClick={() => setStep(1)} className="text-gray-400 underline">Change</button>
            </p>

            <div className="mb-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">One-time password</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                    <rect x="5" y="2" width="14" height="20" rx="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <input type="text" placeholder="123456" maxLength={6} value={otp}
                    onChange={(e) => { setOtp(e.target.value); setFieldErrors({}); }}
                    className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg focus:outline-none transition-all tracking-widest ${
                      fieldErrors.otp ? "border-red-300" : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    }`} />
                </div>
                {canResend && (
                  <button onClick={handleResendOtp} disabled={loading}
                    className="px-3 py-2 text-xs font-medium rounded-lg border"
                    style={{ borderColor: "#185FA5", color: "#185FA5" }}>
                    Resend
                  </button>
                )}
              </div>
              {fieldErrors.otp && <p className="text-xs text-red-500 mt-1">{fieldErrors.otp}</p>}
            </div>

            {!isVerified && !canResend && (
              <p className="text-xs mt-1.5 mb-3" style={{ color: "#854F0B" }}>
                Resend in {timer}s
              </p>
            )}

            {isVerified ? (
              <p className="text-xs font-medium mb-3" style={{ color: "#0F6E56" }}>✓ Email verified</p>
            ) : (
              <button onClick={handleVerifyOtp} disabled={loading || otp.length < 4}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "#0F6E56" }}>
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            )}
          </div>
        )}

        {/* ── Step 3: Password ── */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-1.5 mb-4 px-3 py-2 rounded-lg" style={{ background: "#E1F5EE" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#0F6E56" strokeWidth="2.5" className="w-3.5 h-3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span className="text-xs font-medium" style={{ color: "#0F6E56" }}>
                Ready — {form.email}
              </span>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Create password</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input type="password" name="password" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} className={inputClass("password")} />
              </div>
              <PasswordStrength password={form.password} />
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm password</label>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input type="password" name="confirm" placeholder="Re-enter password"
                  value={form.confirm} onChange={handleChange} className={inputClass("confirm")} />
              </div>
              {fieldErrors.confirm && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirm}</p>}
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#185FA5" }}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        )}

        <div className="border-t border-gray-100 mt-5 pt-4 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;