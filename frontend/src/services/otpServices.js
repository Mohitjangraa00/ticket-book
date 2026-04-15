const API = "http://localhost:5000/api/auth";

/* ================= SEND OTP ================= */
export const sendOTP = async (email) => {
  const res = await fetch(`${API}/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return res.json();
};

/* ================= VERIFY OTP (Optional) ================= */
export const verifyOTP = async (email, otp) => {
  const res = await fetch(`${API}/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return res.json();
};

/* ================= LOGIN WITH OTP ================= */
export const loginWithOTP = async (email, otp) => {
  const res = await fetch(`${API}/login-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  return res.json();
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (email, otp, newPassword) => {
  const res = await fetch(`${API}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, newPassword }),
  });

  return res.json();
};
