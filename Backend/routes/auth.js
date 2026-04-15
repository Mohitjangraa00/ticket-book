const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const router   = express.Router();
const User     = require("../models/User");

const OTP_EXPIRY_MS = 90 * 1000;

/* ─────────────────────────────────────────
   Helper — generate JWT token
───────────────────────────────────────── */
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/* ─────────────────────────────────────────
   Helper — safe user object (no password)
───────────────────────────────────────── */
const safeUser = (user) => ({
  _id:   user._id,
  name:  user.name,
  email: user.email,
  phone: user.phone || null,
});

/* ─────────────────────────────────────────
   POST /api/auth/register
───────────────────────────────────────── */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists)
      return res.status(409).json({ success: false, message: "An account with this email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      isVerified: true,
    });

    // Generate token immediately after register — user is logged in
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
});

/* ─────────────────────────────────────────
   POST /api/auth/login  (password)
───────────────────────────────────────── */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ success: false, message: "No account found with this email" });

    if (!user.isVerified)
      return res.status(403).json({ success: false, message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Incorrect password" });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

/* ─────────────────────────────────────────
   POST /api/auth/login-otp
   Verify OTP and return token (OTP login flow)
───────────────────────────────────────── */
router.post("/login-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!user.otp || !user.otpExpiresAt)
      return res.status(400).json({ success: false, message: "No OTP requested" });

    if (new Date() > new Date(user.otpExpiresAt))
      return res.status(400).json({ success: false, message: "OTP expired. Please request a new one." });

    if (String(user.otp) !== String(otp))
      return res.status(401).json({ success: false, message: "Incorrect OTP" });

    // Clear OTP
    user.otp          = null;
    user.otpExpiresAt = null;
    user.isVerified   = true;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });

  } catch (err) {
    console.error("OTP login error:", err);
    res.status(500).json({ success: false, message: "Login failed. Please try again." });
  }
});

/* ─────────────────────────────────────────
   POST /api/auth/send-otp
───────────────────────────────────────── */
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "No account found with this email" });

    // Rate limit — block if valid OTP already exists
    if (user.otpExpiresAt && new Date() < new Date(user.otpExpiresAt)) {
      const remaining = Math.ceil((new Date(user.otpExpiresAt) - new Date()) / 1000);
      return res.status(429).json({
        success: false,
        message: `OTP already sent. Wait ${remaining} seconds.`,
      });
    }

    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp          = otp;
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
    await user.save();

    await req.app.locals.transporter.sendMail({
      from:    `"Ticket Counter" <${process.env.EMAIL_USER}>`,
      to:      email,
      subject: "Your OTP — Ticket Counter",
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
          <h2 style="color:#185FA5;margin:0 0 8px">Your OTP</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 20px">Use this code to sign in to Ticket Counter.</p>
          <div style="background:#E6F1FB;border-radius:8px;padding:20px;text-align:center">
            <span style="font-size:36px;font-weight:600;letter-spacing:8px;color:#0C447C">${otp}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0">Valid for 90 seconds. Do not share this code.</p>
        </div>
      `,
    });

    console.log(`OTP for ${email}: ${otp}`);
    res.json({ success: true, message: "OTP sent to your email" });

  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

/* ─────────────────────────────────────────
   POST /api/auth/reset-password
───────────────────────────────────────── */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ success: false, message: "All fields are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (!user.otp || !user.otpExpiresAt)
      return res.status(400).json({ success: false, message: "No OTP requested" });

    if (new Date() > new Date(user.otpExpiresAt))
      return res.status(400).json({ success: false, message: "OTP expired" });

    if (String(user.otp) !== String(otp))
      return res.status(401).json({ success: false, message: "Incorrect OTP" });

    user.password     = await bcrypt.hash(newPassword, 10);
    user.otp          = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ success: false, message: "Reset failed." });
  }
});

/* ─────────────────────────────────────────
   GET /api/auth/me
   Get logged-in user's profile (requires token)
───────────────────────────────────────── */
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, async (req, res) => {
  res.json({
    success: true,
    user: safeUser(req.user),
  });
});

module.exports = router;