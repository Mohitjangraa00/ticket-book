// ─────────────────────────────────────────────────────────────────────────────
// routes/busRoutes.js  — fully self-contained, no external middleware needed
// Mount in server.js:  app.use("/api/buses", require("./routes/busRoutes"));
// ─────────────────────────────────────────────────────────────────────────────

const express = require("express");
const router  = express.Router();

// ─── Optional: plug in your existing auth middleware if you have one ──────────
// const { protect } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────

const OPERATORS = [
  { id: "op_001", name: "RedBus Express",    rating: 4.5 },
  { id: "op_002", name: "VRL Travels",       rating: 4.3 },
  { id: "op_003", name: "SRS Travels",       rating: 4.1 },
  { id: "op_004", name: "Orange Tours",      rating: 4.6 },
  { id: "op_005", name: "Kallada Travels",   rating: 4.4 },
  { id: "op_006", name: "IntrCity SmartBus", rating: 4.7 },
  { id: "op_007", name: "Parveen Travels",   rating: 3.9 },
  { id: "op_008", name: "ZingBus",           rating: 4.2 },
];

const POPULAR_ROUTES = [
  { from: "Delhi",     to: "Jaipur",      distanceKm: 282, minPrice: 350,  maxPrice: 950,  dailyBuses: 42 },
  { from: "Mumbai",    to: "Pune",        distanceKm: 149, minPrice: 200,  maxPrice: 600,  dailyBuses: 80 },
  { from: "Bangalore", to: "Hyderabad",   distanceKm: 570, minPrice: 650,  maxPrice: 1400, dailyBuses: 35 },
  { from: "Delhi",     to: "Chandigarh",  distanceKm: 248, minPrice: 300,  maxPrice: 800,  dailyBuses: 55 },
  { from: "Chennai",   to: "Bangalore",   distanceKm: 346, minPrice: 500,  maxPrice: 1100, dailyBuses: 28 },
  { from: "Kolkata",   to: "Bhubaneswar", distanceKm: 440, minPrice: 400,  maxPrice: 900,  dailyBuses: 22 },
];

const COUPONS = {
  FIRST50: { discount: 50,  type: "flat",    description: "Rs.50 off on first booking" },
  BUS10:   { discount: 10,  type: "percent", description: "10% off up to Rs.100" },
  SAVE100: { discount: 100, type: "flat",    description: "Rs.100 flat off" },
};

// In-memory store (replace with MongoDB model when ready)
const bookings  = [];
const heldSeats = {};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const generateBusId = () =>
  "BUS" + Math.random().toString(36).substring(2, 10).toUpperCase();

const generateSeats = (type) => {
  const isSleeper = type && type.includes("sleeper");
  const cols = isSleeper ? ["L1", "L2", "U1", "U2"] : ["A", "B", "C", "D"];
  const rows = isSleeper ? 9 : 10;
  const seats = [];
  for (let r = 1; r <= rows; r++) {
    for (const c of cols) {
      const rand = Math.random();
      seats.push({
        id:      `${r}${c}`,
        row:     r,
        col:     c,
        status:  rand < 0.30 ? "booked" : rand < 0.38 ? "ladies" : "available",
        isUpper: c.includes("U"),
      });
    }
  }
  return seats;
};

const mockBusList = (from, to, date, busType = "all") => {
  const types = [
    { type: "ac_sleeper",     price: 650  },
    { type: "volvo",          price: 950  },
    { type: "non_ac_sleeper", price: 380  },
    { type: "ac_seater",      price: 520  },
    { type: "non_ac_seater",  price: 250  },
    { type: "ac_sleeper",     price: 720  },
    { type: "volvo",          price: 1100 },
    { type: "ac_seater",      price: 480  },
  ];

  return OPERATORS.map((op, i) => {
    const t        = types[i];
    const deptHour = 6 + i * 2;
    const duration = 5 + i;
    const arrHour  = (deptHour + duration) % 24;
    const total    = t.type.includes("sleeper") ? 36 : 45;
    return {
      id:             `bus_${date}_${i}`,
      operatorId:     op.id,
      operatorName:   op.name,
      rating:         op.rating,
      type:           t.type,
      from,
      to,
      date,
      departure:      `${String(deptHour).padStart(2, "0")}:00`,
      arrival:        `${String(arrHour).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
      duration:       `${duration}h ${i % 2 === 0 ? "00" : "30"}m`,
      price:          t.price + Math.floor(Math.random() * 100),
      totalSeats:     total,
      availableSeats: Math.floor(Math.random() * 20) + 5,
      amenities:      ["WiFi", "Charging Point", "Blanket", "AC"].slice(0, (i % 3) + 1),
      liveTracking:   i % 2 === 0,
      boardingPoints: [`${from} Main Bus Stand`, `${from} Railway Station`],
      droppingPoints: [`${to} Bus Terminal`, `${to} City Center`],
      cancellationPolicy: { before24h: 100, between2and24h: 50, within2h: 0 },
    };
  }).filter((b) => busType === "all" || b.type === busType);
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES
// NOTE: specific paths MUST come before wildcard /:id routes
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/buses/search
router.get("/search", (req, res) => {
  const { from, to, date, passengers = 1, busType = "all" } = req.query;
  if (!from || !to || !date) {
    return res.status(400).json({ success: false, message: "from, to and date are required" });
  }
  const results = mockBusList(from, to, date, busType);
  res.json({ success: true, count: results.length, data: results });
});

// GET /api/buses/popular-routes
router.get("/popular-routes", (req, res) => {
  res.json({ success: true, data: POPULAR_ROUTES });
});

// GET /api/buses/operators
router.get("/operators", (req, res) => {
  res.json({ success: true, data: OPERATORS });
});

// GET /api/buses/coupons/available
router.get("/coupons/available", (req, res) => {
  const list = Object.entries(COUPONS).map(([code, c]) => ({ code, ...c }));
  res.json({ success: true, data: list });
});

// POST /api/buses/coupons/validate
router.post("/coupons/validate", (req, res) => {
  const { code, totalAmount } = req.body;
  if (!code || !totalAmount) {
    return res.status(400).json({ success: false, message: "code and totalAmount are required" });
  }
  const coupon = COUPONS[String(code).toUpperCase()];
  if (!coupon) {
    return res.status(404).json({ success: false, message: "Invalid coupon code" });
  }
  const discountAmount =
    coupon.type === "flat"
      ? coupon.discount
      : Math.min(Math.floor((totalAmount * coupon.discount) / 100), 100);
  res.json({
    success: true,
    data: { code: String(code).toUpperCase(), ...coupon, discountAmount, finalAmount: totalAmount - discountAmount },
  });
});

// POST /api/buses/hold-seats
router.post("/hold-seats", (req, res) => {
  const { busId, date, seatIds, passengersCount } = req.body;
  if (!busId || !date || !seatIds || !seatIds.length) {
    return res.status(400).json({ success: false, message: "busId, date and seatIds are required" });
  }
  const holdId    = "HOLD_" + Date.now();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  heldSeats[holdId] = { busId, date, seatIds, passengersCount, expiresAt };
  res.json({ success: true, data: { holdId, expiresAt, seatIds } });
});

// GET /api/buses/bookings/my
router.get("/bookings/my", (req, res) => {
  res.json({ success: true, count: bookings.length, data: bookings });
});

// POST /api/buses/bookings
router.post("/bookings", (req, res) => {
  const { busId, date, selectedSeats, passengers, contact, holdId, paymentMethod, totalAmount } = req.body;
  if (!busId || !date || !selectedSeats || !passengers || !contact || !paymentMethod || !totalAmount) {
    return res.status(400).json({ success: false, message: "All booking fields are required" });
  }
  if (!contact.email || !contact.phone) {
    return res.status(400).json({ success: false, message: "Contact email and phone are required" });
  }
  const bookingId = generateBusId();
  const booking   = {
    bookingId,
    pnr:          bookingId,
    status:       "confirmed",
    busId,
    date,
    selectedSeats,
    passengers,
    contact,
    holdId,
    paymentMethod,
    totalAmount,
    bookedAt:     new Date().toISOString(),
    ticketUrl:    `/api/buses/bookings/${bookingId}/ticket`,
  };
  bookings.push(booking);
  if (holdId && heldSeats[holdId]) delete heldSeats[holdId];
  res.status(201).json({ success: true, data: booking });
});

// GET /api/buses/bookings/:pnr
router.get("/bookings/:pnr", (req, res) => {
  const { pnr } = req.params;
  if (pnr === "BUS123456") {
    return res.json({
      success: true,
      data: {
        bookingId:     "BUS123456",
        pnr:           "BUS123456",
        status:        "confirmed",
        operatorName:  "RedBus Express",
        busType:       "ac_seater",
        from:          "Delhi",
        to:            "Jaipur",
        date:          "2024-04-15",
        departure:     "07:00",
        arrival:       "12:30",
        duration:      "5h 30m",
        selectedSeats: ["3A", "3B"],
        passengers: [
          { name: "Rahul Sharma", age: 28, gender: "male",   seat: "3A" },
          { name: "Priya Sharma", age: 25, gender: "female", seat: "3B" },
        ],
        contact:       { email: "rahul@example.com", phone: "9876543210" },
        totalAmount:   1400,
        paymentMethod: "upi",
        boardingPoint: "Kashmiri Gate ISBT, Delhi",
        droppingPoint: "Sindhi Camp Bus Stand, Jaipur",
        bookedAt:      "2024-04-10T10:30:00.000Z",
      },
    });
  }
  const booking = bookings.find((b) => b.bookingId === pnr || b.pnr === pnr);
  if (!booking) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.json({ success: true, data: booking });
});

// PUT /api/buses/bookings/:bookingId/cancel
router.put("/bookings/:bookingId/cancel", (req, res) => {
  const { bookingId } = req.params;
  const { reason = "" } = req.body;
  const booking       = bookings.find((b) => b.bookingId === bookingId);
  const totalAmount   = booking ? booking.totalAmount : 1400;
  const refundPercent = 50;
  const refundAmount  = Math.floor((totalAmount * refundPercent) / 100);
  if (booking) booking.status = "cancelled";
  res.json({
    success: true,
    data: { bookingId, status: "cancelled", refundAmount, refundPercent, refundEta: "5-7 business days", reason },
  });
});

// GET /api/buses/bookings/:bookingId/ticket
router.get("/bookings/:bookingId/ticket", (req, res) => {
  const { bookingId } = req.params;
  const booking = bookings.find((b) => b.bookingId === bookingId);
  if (!booking && bookingId !== "BUS123456") {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }
  res.json({
    success: true,
    message: "Ticket ready. Integrate pdfkit or puppeteer to stream a PDF.",
    data:    { bookingId, ticketUrl: `/api/buses/bookings/${bookingId}/ticket` },
  });
});

// POST /api/buses/bookings/:bookingId/review
router.post("/bookings/:bookingId/review", (req, res) => {
  const { bookingId } = req.params;
  const { rating, review, tags = [] } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  }
  res.json({ success: true, data: { bookingId, rating, review, tags, submittedAt: new Date().toISOString() } });
});

// GET /api/buses/track/:bookingId
router.get("/track/:bookingId", (req, res) => {
  res.json({
    success: true,
    data: {
      bookingId:         req.params.bookingId,
      lat:               28.6 + Math.random() * 0.5,
      lng:               77.2 + Math.random() * 0.5,
      speed:             65 + Math.floor(Math.random() * 30),
      lastUpdated:       new Date().toISOString(),
      eta:               "12:45 PM",
      currentStop:       "Shahjahanpur",
      distanceRemaining: 84,
    },
  });
});

// GET /api/buses/operators/:operatorId/reviews
router.get("/operators/:operatorId/reviews", (req, res) => {
  res.json({
    success: true,
    data: [
      { user: "Amit K.",  rating: 5, comment: "Very comfortable, on time!",         date: "2024-03-10" },
      { user: "Sneha R.", rating: 4, comment: "Good service, AC was great.",         date: "2024-03-08" },
      { user: "Raj M.",   rating: 4, comment: "Smooth ride, would recommend.",       date: "2024-03-05" },
      { user: "Pooja S.", rating: 3, comment: "Slight delay but staff was helpful.", date: "2024-03-01" },
    ],
  });
});

// GET /api/buses/:busId/seats
router.get("/:busId/seats", (req, res) => {
  const { busId }     = req.params;
  const { date = "" } = req.query;
  const type          = "ac_seater";
  const seats         = generateSeats(type);
  res.json({ success: true, data: { busId, date, type, totalSeats: seats.length, seats } });
});

// GET /api/buses/:busId  — keep this LAST (wildcard)
router.get("/:busId", (req, res) => {
  const { busId } = req.params;
  const op        = OPERATORS[0];
  res.json({
    success: true,
    data: {
      id:             busId,
      operatorId:     op.id,
      operatorName:   op.name,
      rating:         op.rating,
      type:           "ac_seater",
      totalSeats:     45,
      amenities:      ["WiFi", "Charging Point", "AC"],
      liveTracking:   true,
      boardingPoints: ["Delhi Main Bus Stand", "Delhi Railway Station"],
      droppingPoints: ["Destination Bus Terminal", "Destination City Center"],
      cancellationPolicy: { before24h: 100, between2and24h: 50, within2h: 0 },
    },
  });
});

module.exports = router;