const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

/* ─── Route imports ─── */
const authRoutes   = require("./routes/auth");
const trainRoutes  = require("./routes/trainRoutes");
const flightRoutes = require("./routes/FlightRoutes");
const busRoutes    = require("./routes/busRoutes");

const app = express();

/* ─────────────────────────────────────────
   MIDDLEWARE
───────────────────────────────────────── */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://192.168.1.9:3000",
    ],
    credentials: true,
  })
);
app.use(express.json());

/* ─────────────────────────────────────────
   MONGODB
───────────────────────────────────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  });

/* ─────────────────────────────────────────
   EMAIL TRANSPORTER
───────────────────────────────────────── */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.warn("⚠️  Email transporter error:", err.message);
  else     console.log("✅  Email transporter ready");
});

app.locals.transporter = transporter;

/* ─────────────────────────────────────────
   ROUTES
───────────────────────────────────────── */
app.use("/api/auth",    authRoutes);
app.use("/api/trains",  trainRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/buses",   busRoutes);

/* ─────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────── */
app.get("/api/health", (req, res) => {
  res.json({
    status:    "ok",
    timestamp: new Date().toISOString(),
    mongo:     mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

/* ─────────────────────────────────────────
   404 HANDLER
───────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

/* ─────────────────────────────────────────
   GLOBAL ERROR HANDLER
───────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

/* ─────────────────────────────────────────
   START SERVER
───────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🚀  Server running at http://localhost:${PORT}\n`);

  console.log(`📋  Auth routes:`);
  console.log(`    POST   /api/auth/register`);
  console.log(`    POST   /api/auth/login`);
  console.log(`    POST   /api/auth/login-otp`);
  console.log(`    POST   /api/auth/send-otp`);
  console.log(`    POST   /api/auth/verify-otp`);
  console.log(`    POST   /api/auth/reset-password`);
  console.log(`    GET    /api/auth/me`);

  console.log(`\n📋  Train routes:`);
  console.log(`    GET    /api/trains/search?from=NDLS&to=MMCT&date=2026-04-16&class=SL`);
  console.log(`    GET    /api/trains/details?trainNo=12951`);
  console.log(`    POST   /api/trains/book`);
  console.log(`    GET    /api/trains/pnr/:pnr`);
  console.log(`    GET    /api/trains/my-bookings`);
  console.log(`    POST   /api/trains/cancel/:pnr`);

  console.log(`\n📋  Flight routes:`);
  console.log(`    GET    /api/flights/search?from=DEL&to=BOM&date=2026-04-16&passengers=1&cabin=economy`);
  console.log(`    GET    /api/flights/details?flightId=6E-201`);
  console.log(`    POST   /api/flights/book`);
  console.log(`    GET    /api/flights/pnr/:pnr`);
  console.log(`    GET    /api/flights/my-bookings`);
  console.log(`    POST   /api/flights/cancel/:pnr`);

  console.log(`\n📋  Bus routes:`);
  console.log(`    GET    /api/buses/search?from=Delhi&to=Jaipur&date=2026-04-16&passengers=1&busType=all`);
  console.log(`    GET    /api/buses/popular-routes`);
  console.log(`    GET    /api/buses/operators`);
  console.log(`    GET    /api/buses/:busId`);
  console.log(`    GET    /api/buses/:busId/seats?date=2026-04-16`);
  console.log(`    POST   /api/buses/hold-seats`);
  console.log(`    POST   /api/buses/coupons/validate`);
  console.log(`    GET    /api/buses/coupons/available`);
  console.log(`    POST   /api/buses/bookings`);
  console.log(`    GET    /api/buses/bookings/my`);
  console.log(`    GET    /api/buses/bookings/:pnr`);
  console.log(`    PUT    /api/buses/bookings/:bookingId/cancel`);
  console.log(`    GET    /api/buses/bookings/:bookingId/ticket`);
  console.log(`    POST   /api/buses/bookings/:bookingId/review`);
  console.log(`    GET    /api/buses/track/:bookingId`);

  console.log(`\n📋  Other:`);
  console.log(`    GET    /api/health`);
});