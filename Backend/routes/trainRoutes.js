const express        = require("express");
const router         = express.Router();
const Booking        = require("../models/Booking");
const authMiddleware = require("../middleware/authMiddleware");

const generatePNR = () =>
  Math.floor(1000000000 + Math.random() * 9000000000).toString();

const getMockTrains = (from, to) => [
  {
    TrainNo: "12951", TrainName: "Rajdhani Express",
    FromStationName: from, ToStationName: to,
    departTime: "16:55", arrivalTime: "08:15",
    duration: "15h 20m", durationMins: 920,
    fare: 1450, availability: "AVAILABLE",
    runningDays: "Mon, Wed, Thu, Fri, Sat",
  },
  {
    TrainNo: "12953", TrainName: "August Kranti Rajdhani",
    FromStationName: from, ToStationName: to,
    departTime: "17:40", arrivalTime: "10:55",
    duration: "17h 15m", durationMins: 1035,
    fare: 1380, availability: "WAITING", waitingCount: 4,
    runningDays: "Daily",
  },
  {
    TrainNo: "12909", TrainName: "Garib Rath Express",
    FromStationName: from, ToStationName: to,
    departTime: "15:35", arrivalTime: "05:45",
    duration: "14h 10m", durationMins: 850,
    fare: 820, availability: "AVAILABLE",
    runningDays: "Tue, Sat",
  },
];

/* ── GET /api/trains/search — public ── */
router.get("/search", async (req, res) => {
  try {
    const { from, to, date } = req.query;
    if (!from || !to || !date)
      return res.status(400).json({ success: false, message: "from, to, and date are required" });
    if (from === to)
      return res.status(400).json({ success: false, message: "Origin and destination cannot be the same" });

    const trains = getMockTrains(from, to);
    res.json({ success: true, trains, count: trains.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch trains." });
  }
});

/* ── GET /api/trains/details — public ── */
router.get("/details", async (req, res) => {
  try {
    const classes = [
      { type: "SL", available: 45, waitingList: 0, fare: 545  },
      { type: "3A", available: 12, waitingList: 0, fare: 1450 },
      { type: "2A", available: 0,  waitingList: 3, fare: 2100 },
      { type: "1A", available: 4,  waitingList: 0, fare: 3950 },
      { type: "CC", available: 0,  waitingList: 0, fare: 990  },
    ];
    res.json({ success: true, classes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch details." });
  }
});

/* ── POST /api/trains/book — PROTECTED ── */
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const {
      trainNo, trainName, from, to, date,
      classType, passengers, contact, fare,
      departTime, arrivalTime, duration,
    } = req.body;

    if (!trainNo || !from || !to || !date || !passengers?.length || !fare)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    let pnr, attempts = 0;
    do {
      pnr = generatePNR();
      const exists = await Booking.findOne({ pnr });
      if (!exists) break;
    } while (++attempts < 5);

    const isWaiting  = Math.random() < 0.15;
    const status     = isWaiting ? "WAITING" : "CONFIRMED";
    const seatInfo   = isWaiting ? null : `S${Math.floor(Math.random()*12)+1} / ${Math.floor(Math.random()*72)+1} (${["Lower","Middle","Upper"][Math.floor(Math.random()*3)]})`;
    const waitingNum = isWaiting ? Math.floor(Math.random()*10)+1 : null;

    const booking = await Booking.create({
      pnr,
      userId:        req.user._id,    // ← comes from JWT now
      trainNo, trainName: trainName || trainNo,
      from, to, date, classType,
      passengers, contact, fare,
      status, seatInfo, waitingNumber: waitingNum,
      departTime, arrivalTime, duration,
    });

    // Send confirmation email
    try {
      await req.app.locals.transporter.sendMail({
        from:    `"Ticket Counter" <${process.env.EMAIL_USER}>`,
        to:      contact?.email,
        subject: `Booking ${status} — PNR ${pnr}`,
        html: `<p>PNR: <strong>${pnr}</strong> | Status: ${status} | ${from} → ${to} on ${date}</p>`,
      });
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ success: false, message: "Booking failed." });
  }
});

/* ── GET /api/trains/pnr/:pnr — public ── */
router.get("/pnr/:pnr", async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr });
    if (!booking)
      return res.status(404).json({ success: false, message: "PNR not found" });
    res.json({ success: true, ...booking.toObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: "PNR check failed." });
  }
});

/* ── GET /api/trains/my-bookings — PROTECTED ── */
router.get("/my-bookings", authMiddleware, async (req, res) => {
  try {
    // Uses userId from JWT token — no need to pass userId in query
    const bookings = await Booking.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings, count: bookings.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
});

/* ── POST /api/trains/cancel/:pnr — PROTECTED ── */
router.post("/cancel/:pnr", authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findOne({ pnr: req.params.pnr });
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    // Only the owner can cancel
    if (String(booking.userId) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "You can only cancel your own bookings" });

    if (booking.status === "CANCELLED")
      return res.status(400).json({ success: false, message: "Already cancelled" });

    const journeyTime    = new Date(`${booking.date}T${booking.departTime || "00:00"}`);
    const hoursLeft      = (journeyTime - new Date()) / (1000 * 60 * 60);
    const refundPct      = hoursLeft >= 48 ? 0.75 : hoursLeft >= 12 ? 0.50 : hoursLeft >= 0 ? 0.25 : 0;
    const refundAmount   = Math.round(booking.fare * refundPct);

    booking.status = "CANCELLED";
    booking.refund = refundAmount;
    await booking.save();

    res.json({
      success: true,
      message: "Booking cancelled",
      refundAmount,
      refundPercent: Math.round(refundPct * 100),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cancellation failed." });
  }
});

module.exports = router;