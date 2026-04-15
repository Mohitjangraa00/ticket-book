// ─────────────────────────────────────────────────────────────────────────────
// BusService.js
// Central service layer for all bus-related API calls.
// Replace BASE_URL and swap mock functions with real axios/fetch calls.
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getAuthHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || "Something went wrong");
  }
  return res.json();
};

const api = {
  get: (path) =>
    fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }).then(handleResponse),

  post: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
    }).then(handleResponse),
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_BUSES = [
  {
    id: "bus_001",
    operatorId: "op_001",
    operatorName: "RedBus Express",
    busNumber: "RJ-14-AB-1234",
    type: "ac_sleeper",
    totalSeats: 36,
    amenities: ["WiFi", "Charging Point", "Blanket", "Water Bottle"],
    rating: 4.5,
    totalRatings: 1248,
    liveTracking: true,
    from: "Delhi",
    to: "Jaipur",
    fromStationId: "STN_DEL_ISBT",
    toStationId: "STN_JAI_SINDHI",
    departure: "07:00",
    arrival: "12:30",
    duration: "5h 30m",
    price: 650,
    date: "2024-04-15",
    availableSeats: 12,
    boardingPoints: ["Kashmiri Gate ISBT", "Dhaula Kuan", "Gurgaon Toll"],
    droppingPoints: ["Sindhi Camp", "Naraina Singh Circle", "Ajmer Road"],
    cancellationPolicy: {
      before24h: 100,
      between2and24h: 50,
      within2h: 0,
    },
  },
  {
    id: "bus_002",
    operatorId: "op_002",
    operatorName: "VRL Travels",
    busNumber: "KA-01-CD-5678",
    type: "volvo",
    totalSeats: 45,
    amenities: ["WiFi", "Charging Point", "AC"],
    rating: 4.3,
    totalRatings: 876,
    liveTracking: true,
    from: "Bangalore",
    to: "Hyderabad",
    fromStationId: "STN_BLR_MAJES",
    toStationId: "STN_HYD_MGBS",
    departure: "21:00",
    arrival: "06:30",
    duration: "9h 30m",
    price: 950,
    date: "2024-04-15",
    availableSeats: 8,
    boardingPoints: ["Majestic Bus Stand", "Silk Board", "Electronic City"],
    droppingPoints: ["MGBS Hyderabad", "Secunderabad", "Hitech City"],
    cancellationPolicy: {
      before24h: 100,
      between2and24h: 50,
      within2h: 0,
    },
  },
];

const MOCK_BOOKINGS = [];

// ─── 1. SEARCH ────────────────────────────────────────────────────────────────

/**
 * Search available buses between two cities on a date.
 * @param {Object} params - { from, to, date, passengers, busType }
 * @returns {Promise<Array>} list of bus objects
 *
 * BACKEND: GET /buses/search?from=Delhi&to=Jaipur&date=2024-04-15&passengers=2&busType=all
 */
export const searchBuses = async ({ from, to, date, passengers = 1, busType = "all" }) => {
  // ── Live: uncomment below ──
  // return api.get(`/buses/search?from=${from}&to=${to}&date=${date}&passengers=${passengers}&busType=${busType}`);

  // ── Mock ──
  return new Promise((resolve) => {
    setTimeout(() => {
      const operators = [
        { name: "RedBus Express", rating: 4.5, type: "ac_sleeper", price: 650 },
        { name: "VRL Travels", rating: 4.3, type: "volvo", price: 950 },
        { name: "SRS Travels", rating: 4.1, type: "non_ac_sleeper", price: 380 },
        { name: "Orange Tours", rating: 4.6, type: "ac_seater", price: 520 },
        { name: "Parveen Travels", rating: 3.9, type: "non_ac_seater", price: 250 },
        { name: "Kallada Travels", rating: 4.4, type: "ac_sleeper", price: 720 },
        { name: "IntrCity SmartBus", rating: 4.7, type: "volvo", price: 1100 },
        { name: "ZingBus", rating: 4.2, type: "ac_seater", price: 480 },
      ];

      const filtered = operators.filter(
        (op) => busType === "all" || op.type === busType
      );

      const results = filtered.map((op, i) => {
        const deptHour = 6 + i * 2;
        const duration = 5 + i;
        const arrHour = (deptHour + duration) % 24;
        const totalSeats = op.type.includes("sleeper") ? 36 : 45;

        return {
          id: `bus_${Date.now()}_${i}`,
          operatorName: op.name,
          type: op.type,
          rating: op.rating,
          totalRatings: Math.floor(Math.random() * 1500) + 200,
          from,
          to,
          date,
          departure: `${String(deptHour).padStart(2, "0")}:00`,
          arrival: `${String(arrHour).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
          duration: `${duration}h ${i % 2 === 0 ? "00" : "30"}m`,
          price: op.price + Math.floor(Math.random() * 100),
          totalSeats,
          availableSeats: Math.floor(Math.random() * 20) + 5,
          amenities: ["WiFi", "Charging Point", "Blanket", "AC"].slice(0, Math.floor(Math.random() * 3) + 1),
          liveTracking: Math.random() > 0.4,
          boardingPoints: [`${from} Main Bus Stand`, `${from} Railway Station`],
          droppingPoints: [`${to} Bus Terminal`, `${to} City Center`],
          cancellationPolicy: { before24h: 100, between2and24h: 50, within2h: 0 },
        };
      });

      resolve(results);
    }, 800);
  });
};

// ─── 2. SEAT LAYOUT ───────────────────────────────────────────────────────────

/**
 * Get seat layout and availability for a specific bus.
 * @param {string} busId
 * @param {string} date
 * @returns {Promise<Object>} { busId, type, seats: [...] }
 *
 * BACKEND: GET /buses/:busId/seats?date=2024-04-15
 */
export const getBusSeatLayout = async (busId, date) => {
  // ── Live ──
  // return api.get(`/buses/${busId}/seats?date=${date}`);

  // ── Mock ──
  return new Promise((resolve) => {
    setTimeout(() => {
      const type = "ac_seater";
      const rows = 10;
      const cols = ["A", "B", "C", "D"];
      const seats = [];

      for (let r = 1; r <= rows; r++) {
        for (let c of cols) {
          const rand = Math.random();
          seats.push({
            id: `${r}${c}`,
            row: r,
            col: c,
            status: rand < 0.3 ? "booked" : rand < 0.38 ? "ladies" : "available",
            isUpper: false,
            price: 0, // 0 = same as base bus price; set non-zero for premium seats
          });
        }
      }

      resolve({ busId, type, totalSeats: seats.length, seats });
    }, 500);
  });
};

// ─── 3. BOOKING ───────────────────────────────────────────────────────────────

/**
 * Hold seats temporarily before payment (prevents double booking).
 * @param {Object} payload - { busId, date, seatIds, passengersCount }
 * @returns {Promise<Object>} { holdId, expiresAt }
 *
 * BACKEND: POST /buses/hold-seats
 */
export const holdSeats = async ({ busId, date, seatIds, passengersCount }) => {
  // ── Live ──
  // return api.post("/buses/hold-seats", { busId, date, seatIds, passengersCount });

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        holdId: `HOLD_${Date.now()}`,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 min
        seatIds,
      });
    }, 400);
  });
};

/**
 * Create a confirmed booking after payment success.
 * @param {Object} payload
 * @returns {Promise<Object>} booking confirmation object
 *
 * BACKEND: POST /buses/bookings
 */
export const createBooking = async ({
  busId,
  date,
  selectedSeats,
  passengers,
  contact,
  holdId,
  paymentMethod,
  totalAmount,
}) => {
  // ── Live ──
  // return api.post("/buses/bookings", { busId, date, selectedSeats, passengers, contact, holdId, paymentMethod, totalAmount });

  return new Promise((resolve) => {
    setTimeout(() => {
      const bookingId = "BUS" + Math.random().toString(36).substring(2, 10).toUpperCase();
      const booking = {
        bookingId,
        status: "confirmed",
        busId,
        date,
        selectedSeats,
        passengers,
        contact,
        paymentMethod,
        totalAmount,
        pnr: bookingId,
        bookedAt: new Date().toISOString(),
        ticketUrl: `/tickets/${bookingId}.pdf`,
      };
      MOCK_BOOKINGS.push(booking);
      resolve(booking);
    }, 1200);
  });
};

// ─── 4. PNR / BOOKING STATUS ─────────────────────────────────────────────────

/**
 * Fetch booking details by PNR or booking ID.
 * @param {string} pnr
 * @returns {Promise<Object>} booking object
 *
 * BACKEND: GET /buses/bookings/:pnr
 */
export const getBookingByPNR = async (pnr) => {
  // ── Live ──
  // return api.get(`/buses/bookings/${pnr}`);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const found = MOCK_BOOKINGS.find((b) => b.bookingId === pnr || b.pnr === pnr);
      if (found) {
        resolve(found);
      } else {
        // Demo static booking for testing
        if (pnr === "BUS123456") {
          resolve({
            bookingId: "BUS123456",
            pnr: "BUS123456",
            status: "confirmed",
            operatorName: "RedBus Express",
            busType: "ac_seater",
            from: "Delhi",
            to: "Jaipur",
            date: "2024-04-15",
            departure: "07:00",
            arrival: "12:30",
            duration: "5h 30m",
            selectedSeats: ["3A", "3B"],
            passengers: [
              { name: "Rahul Sharma", age: 28, gender: "male", seat: "3A", idType: "aadhar", idNumber: "XXXX-XXXX-1234" },
              { name: "Priya Sharma", age: 25, gender: "female", seat: "3B", idType: "aadhar", idNumber: "XXXX-XXXX-5678" },
            ],
            contact: { email: "rahul@example.com", phone: "9876543210" },
            totalAmount: 1400,
            paymentMethod: "upi",
            boardingPoint: "Kashmiri Gate ISBT, Delhi",
            droppingPoint: "Sindhi Camp Bus Stand, Jaipur",
            bookedAt: "2024-04-10T10:30:00.000Z",
          });
        } else {
          reject(new Error("Booking not found"));
        }
      }
    }, 700);
  });
};

/**
 * Get all bookings for the current authenticated user.
 * @returns {Promise<Array>}
 *
 * BACKEND: GET /buses/bookings/my
 */
export const getMyBookings = async () => {
  // return api.get("/buses/bookings/my");

  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_BOOKINGS), 500);
  });
};

// ─── 5. CANCELLATION ─────────────────────────────────────────────────────────

/**
 * Cancel a booking by ID.
 * @param {string} bookingId
 * @param {string} reason - optional cancellation reason
 * @returns {Promise<Object>} { bookingId, status, refundAmount, refundEta }
 *
 * BACKEND: PUT /buses/bookings/:bookingId/cancel
 */
export const cancelBooking = async (bookingId, reason = "") => {
  // return api.put(`/buses/bookings/${bookingId}/cancel`, { reason });

  return new Promise((resolve) => {
    setTimeout(() => {
      const booking = MOCK_BOOKINGS.find((b) => b.bookingId === bookingId);
      const refundPercent = 50; // simplified: real logic checks time-to-departure
      const refundAmount = booking ? Math.floor((booking.totalAmount * refundPercent) / 100) : 0;
      resolve({
        bookingId,
        status: "cancelled",
        refundAmount,
        refundPercent,
        refundEta: "5-7 business days",
        reason,
      });
    }, 800);
  });
};

// ─── 6. OPERATORS & FILTERS ───────────────────────────────────────────────────

/**
 * Fetch all bus operators (for filter dropdowns).
 * BACKEND: GET /buses/operators
 */
export const getBusOperators = async () => {
  // return api.get("/buses/operators");

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: "op_001", name: "RedBus Express", rating: 4.5, logo: null },
        { id: "op_002", name: "VRL Travels", rating: 4.3, logo: null },
        { id: "op_003", name: "SRS Travels", rating: 4.1, logo: null },
        { id: "op_004", name: "Orange Tours", rating: 4.6, logo: null },
        { id: "op_005", name: "Kallada Travels", rating: 4.4, logo: null },
        { id: "op_006", name: "IntrCity SmartBus", rating: 4.7, logo: null },
      ]);
    }, 300);
  });
};

/**
 * Fetch popular routes for the home screen.
 * BACKEND: GET /buses/popular-routes
 */
export const getPopularRoutes = async () => {
  // return api.get("/buses/popular-routes");

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { from: "Delhi", to: "Jaipur", startingPrice: 350, duration: "5h", dailyBuses: 42 },
        { from: "Mumbai", to: "Pune", startingPrice: 200, duration: "3h", dailyBuses: 80 },
        { from: "Bangalore", to: "Hyderabad", startingPrice: 650, duration: "9h", dailyBuses: 35 },
        { from: "Delhi", to: "Chandigarh", startingPrice: 300, duration: "4h", dailyBuses: 55 },
        { from: "Chennai", to: "Bangalore", startingPrice: 500, duration: "7h", dailyBuses: 28 },
        { from: "Kolkata", to: "Bhubaneswar", startingPrice: 400, duration: "6h", dailyBuses: 22 },
      ]);
    }, 300);
  });
};

// ─── 7. LIVE TRACKING ────────────────────────────────────────────────────────

/**
 * Get live GPS location of a bus by booking ID.
 * @param {string} bookingId
 * @returns {Promise<Object>} { lat, lng, speed, lastUpdated, eta, currentStop }
 *
 * BACKEND: GET /buses/track/:bookingId
 */
export const trackBus = async (bookingId) => {
  // return api.get(`/buses/track/${bookingId}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        bookingId,
        lat: 28.6 + Math.random() * 0.5,
        lng: 77.2 + Math.random() * 0.5,
        speed: 65 + Math.floor(Math.random() * 30),
        lastUpdated: new Date().toISOString(),
        eta: "12:45 PM",
        currentStop: "Shahjahanpur",
        distanceRemaining: 84,
      });
    }, 400);
  });
};

// ─── 8. RATINGS ──────────────────────────────────────────────────────────────

/**
 * Submit a rating/review for a completed trip.
 * BACKEND: POST /buses/bookings/:bookingId/review
 */
export const submitReview = async (bookingId, { rating, review, tags = [] }) => {
  // return api.post(`/buses/bookings/${bookingId}/review`, { rating, review, tags });

  return new Promise((resolve) => {
    setTimeout(() => resolve({ success: true, bookingId, rating }), 400);
  });
};

// ─── 9. OFFERS & COUPONS ─────────────────────────────────────────────────────

/**
 * Validate and apply a coupon code.
 * BACKEND: POST /buses/coupons/validate
 */
export const validateCoupon = async (code, totalAmount) => {
  // return api.post("/buses/coupons/validate", { code, totalAmount });

  return new Promise((resolve, reject) => {
    const COUPONS = {
      FIRST50: { discount: 50, type: "flat", description: "₹50 off on first booking" },
      BUS10: { discount: 10, type: "percent", description: "10% off up to ₹100" },
      SAVE100: { discount: 100, type: "flat", description: "₹100 flat off" },
    };

    setTimeout(() => {
      const coupon = COUPONS[code.toUpperCase()];
      if (!coupon) { reject(new Error("Invalid coupon code")); return; }
      const discountAmount = coupon.type === "flat"
        ? coupon.discount
        : Math.min(Math.floor((totalAmount * coupon.discount) / 100), 100);
      resolve({ code, ...coupon, discountAmount, finalAmount: totalAmount - discountAmount });
    }, 500);
  });
};

// ─── Default export (named exports above; this is a convenience object) ───────

const BusService = {
  searchBuses,
  getBusSeatLayout,
  holdSeats,
  createBooking,
  getBookingByPNR,
  getMyBookings,
  cancelBooking,
  getBusOperators,
  getPopularRoutes,
  trackBus,
  submitReview,
  validateCoupon,
};

export default BusService;