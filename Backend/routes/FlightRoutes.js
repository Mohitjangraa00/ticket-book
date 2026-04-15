const express        = require("express");
const router         = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

/* ── Helpers ── */
const generatePNR = () => "TC" + Math.floor(10000000 + Math.random() * 90000000).toString();

const getMockFlights = (from, to, passengers, cabin) => {
  const priceMult = { economy: 1, business: 3.8, first: 9.2 };
  const base = 3500 * (priceMult[cabin] || 1) * passengers;

  return [
    {
      flightId:    "6E-201",
      flightNo:    "6E-201",
      airline:     "IndiGo",
      airlineCode: "6E",
      from, to,
      departTime:   "06:00",
      arrivalTime:  "08:15",
      duration:     "2h 15m",
      durationMins: 135,
      stops:        "Non-stop",
      stopCity:     null,
      fare:         Math.round(base * 0.88),
      amenities:    ["24kg baggage", "In-flight meal", "USB charging"],
    },
    {
      flightId:    "AI-102",
      flightNo:    "AI-102",
      airline:     "Air India",
      airlineCode: "AI",
      from, to,
      departTime:   "09:30",
      arrivalTime:  "14:15",
      duration:     "4h 45m",
      durationMins: 285,
      stops:        "1 stop",
      stopCity:     "HYD",
      fare:         Math.round(base * 0.72),
      amenities:    ["24kg baggage", "Meal included"],
    },
    {
      flightId:    "UK-924",
      flightNo:    "UK-924",
      airline:     "Vistara",
      airlineCode: "UK",
      from, to,
      departTime:   "14:30",
      arrivalTime:  "16:50",
      duration:     "2h 20m",
      durationMins: 140,
      stops:        "Non-stop",
      stopCity:     null,
      fare:         Math.round(base * 1.05),
      amenities:    ["25kg baggage", "Gourmet meal", "Priority boarding", "Extra legroom"],
    },
    {
      flightId:    "SG-101",
      flightNo:    "SG-101",
      airline:     "SpiceJet",
      airlineCode: "SG",
      from, to,
      departTime:   "18:45",
      arrivalTime:  "20:55",
      duration:     "2h 10m",
      durationMins: 130,
      stops:        "Non-stop",
      stopCity:     null,
      fare:         Math.round(base * 0.78),
      amenities:    ["15kg baggage"],
    },
  ];
};

const getCabins = (fare) => [
  {
    type: "economy", label: "Economy", available: 42, fare: fare,
    amenities: ["24kg checked baggage", "In-flight meal", "USB charging", "Seat selection"],
  },
  {
    type: "business", label: "Business", available: 8, fare: Math.round(fare * 3.8),
    amenities: ["32kg baggage", "Lie-flat seat", "Lounge access", "Priority boarding", "Gourmet dining"],
  },
  {
    type: "first", label: "First class", available: 4, fare: Math.round(fare * 9.2),
    amenities: ["40kg baggage", "Private suite", "Chauffeur service", "Spa access", "À la carte dining"],
  },
];

/* ── GET /api/flights/search ── */
router.get("/search", async (req, res) => {
  try {
    const { from, to, date, passengers = 1, cabin = "economy" } = req.query;
    if (!from || !to || !date)
      return res.status(400).json({ success: false, message: "from, to, and date are required" });
    if (from === to)
      return res.status(400).json({ success: false, message: "Origin and destination cannot be the same" });

    const flights = getMockFlights(from, to, Number(passengers), cabin);
    res.json({ success: true, flights, count: flights.length });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch flights." });
  }
});

/* ── GET /api/flights/details ── */
router.get("/details", async (req, res) => {
  try {
    const { flightId, passengers = 1, cabin = "economy" } = req.query;
    const baseFare = 3800 * Number(passengers);
    res.json({ success: true, flightId, cabins: getCabins(baseFare) });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch details." });
  }
});

/* ── POST /api/flights/book — PROTECTED ── */
router.post("/book", authMiddleware, async (req, res) => {
  try {
    const {
      flightNo, airline, from, to, date, cabin,
      departTime, arrivalTime, duration,
      passengers, contact, fare,
    } = req.body;

    if (!flightNo || !from || !to || !date || !passengers?.length || !fare)
      return res.status(400).json({ success: false, message: "Missing required fields" });

    const pnr      = generatePNR();
    const status   = "CONFIRMED";
    const seatInfo = `${Math.floor(Math.random() * 30) + 1}${["A","B","C","D","E","F"][Math.floor(Math.random()*6)]}`;
    const gate     = `${String.fromCharCode(65 + Math.floor(Math.random() * 8))}${Math.floor(Math.random() * 20) + 1}`;

    const booking = {
      pnr, status, seatInfo, gate,
      userId:     req.user._id,
      flightNo, airline, from, to, date, cabin,
      departTime, arrivalTime, duration,
      stops:      "Non-stop",
      passengers, contact, fare,
      createdAt:  new Date().toISOString(),
    };

    // Email confirmation
    try {
      await req.app.locals.transporter.sendMail({
        from:    `"Ticket Counter" <${process.env.EMAIL_USER}>`,
        to:      contact?.email,
        subject: `Booking Confirmed — ${pnr} | ${airline} ${flightNo}`,
        html: `
          <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px">
            <h2 style="color:#27500A;margin:0 0 4px">Flight Confirmed</h2>
            <p style="color:#6b7280;font-size:14px;margin:0 0 20px">${airline} ${flightNo}</p>
            <table style="width:100%;font-size:14px;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Booking ref</td><td style="font-weight:600;letter-spacing:2px">${pnr}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Route</td><td>${from} → ${to}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Date</td><td>${date}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af;border-bottom:1px solid #f3f4f6">Seat</td><td>${seatInfo} · Gate ${gate}</td></tr>
              <tr><td style="padding:8px 0;color:#9ca3af">Fare</td><td>₹${fare?.toLocaleString("en-IN")}</td></tr>
            </table>
          </div>
        `,
      });
    } catch (e) {
      console.warn("Email failed:", e.message);
    }

    res.status(201).json({ success: true, booking });
  } catch (err) {
    console.error("Flight booking error:", err);
    res.status(500).json({ success: false, message: "Booking failed." });
  }
});

/* ── GET /api/flights/pnr/:pnr ── */
router.get("/pnr/:pnr", async (req, res) => {
  try {
    // In production: look up from FlightBooking model in DB
    // Mock response for now
    res.json({
      success:    true,
      pnr:        req.params.pnr,
      status:     "CONFIRMED",
      airline:    "IndiGo",
      flightNo:   "6E-201",
      from:       "DEL",
      to:         "BOM",
      date:       "2026-04-16",
      departTime: "06:00",
      arrivalTime:"08:15",
      duration:   "2h 15m",
      stops:      "Non-stop",
      cabin:      "economy",
      seatInfo:   "12A",
      gate:       "B14",
      fare:       4299,
      passengers: [{ name: "Golu Jangra", age: 28, gender: "Male", seat: "Window", meal: "Vegetarian" }],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "PNR check failed." });
  }
});

/* ── GET /api/flights/my-bookings — PROTECTED ── */
router.get("/my-bookings", authMiddleware, async (req, res) => {
  try {
    // In production: query FlightBooking.find({ userId: req.user._id })
    res.json({ success: true, bookings: [], count: 0 });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
});

/* ── POST /api/flights/cancel/:pnr — PROTECTED ── */
router.post("/cancel/:pnr", authMiddleware, async (req, res) => {
  try {
    const refundAmount = 3200; // In production: calculate based on cancellation policy
    res.json({
      success:      true,
      message:      "Flight booking cancelled",
      pnr:          req.params.pnr,
      refundAmount,
      refundPercent: 75,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Cancellation failed." });
  }
});

module.exports = router;