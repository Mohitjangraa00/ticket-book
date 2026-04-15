import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { checkFlightPNR } from "../../services/Flightservices";

const STATUS_CONFIG = {
  CONFIRMED: {
    bg:       "linear-gradient(135deg, #173404 0%, #27500A 55%, #3B6D11 100%)",
    badge:    { bg: "#EAF3DE", text: "#27500A" },
    headline: "Flight confirmed",
    sub:      "Your seat is assigned.",
    icon:     <polyline points="20 6 9 17 4 12" />,
  },
  CANCELLED: {
    bg:       "linear-gradient(135deg, #501313 0%, #791F1F 55%, #A32D2D 100%)",
    badge:    { bg: "#FCEBEB", text: "#791F1F" },
    headline: "Flight cancelled",
    sub:      "Refund will be processed in 5–7 days.",
    icon:     <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>,
  },
  DELAYED: {
    bg:       "linear-gradient(135deg, #412402 0%, #633806 55%, #854F0B 100%)",
    badge:    { bg: "#FAEEDA", text: "#633806" },
    headline: "Flight delayed",
    sub:      "New departure time updated below.",
    icon:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  },
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-b-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value}</span>
  </div>
);

const FlightPNRStatus = () => {
  const { state }   = useLocation();
  const navigate    = useNavigate();

  const [pnr, setPnr]         = useState(state?.pnr || "");
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const handleCheck = async () => {
    if (pnr.trim().length < 5) { setError("Please enter a valid booking reference."); return; }
    setError(""); setBooking(null); setLoading(true);
    try {
      const data = await checkFlightPNR(pnr.trim());
      setBooking(data);
    } catch {
      setError("Booking not found. Please check the reference and try again.");
    } finally {
      setLoading(false);
    }
  };

  const cfg = booking ? (STATUS_CONFIG[booking.status] || STATUS_CONFIG.CONFIRMED) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative overflow-hidden pb-14 pt-5 px-5"
        style={{
          background: cfg
            ? cfg.bg
            : "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 55%, #185FA5 100%)",
          borderRadius: "0 0 24px 24px",
          transition: "background 0.4s",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <button onClick={() => navigate(-1)} className="relative flex items-center gap-1.5 mb-5 text-sm"
          style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {cfg ? (
          <div className="relative flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.2)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7">
                {cfg.icon}
              </svg>
            </div>
            <p className="text-white text-xl font-medium">{cfg.headline}</p>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{cfg.sub}</p>
          </div>
        ) : (
          <div className="relative">
            <p className="text-white text-lg font-medium">Flight status</p>
            <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
              Check your booking & flight status
            </p>
          </div>
        )}
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Input */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            Enter booking reference
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
              </svg>
              <input type="text" placeholder="e.g. TC2826491" value={pnr}
                onChange={(e) => { setPnr(e.target.value.toUpperCase()); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-medium tracking-widest" />
            </div>
            <button onClick={handleCheck} disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 flex items-center gap-1.5"
              style={{ background: "#185FA5" }}>
              {loading ? (
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
                </svg>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  Check
                </>
              )}
            </button>
          </div>
          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>

        {/* Result */}
        {booking && cfg && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

            {/* Delay notice */}
            {booking.status === "DELAYED" && booking.newDepartTime && (
              <div className="px-4 py-3 rounded-xl mb-3" style={{ background: "#FAEEDA" }}>
                <p className="text-sm font-medium" style={{ color: "#633806" }}>
                  New departure: {booking.newDepartTime}
                </p>
                <p className="text-xs mt-1" style={{ color: "#854F0B" }}>
                  {booking.delayReason || "Flight delayed due to operational reasons."}
                </p>
              </div>
            )}

            {/* Booking info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400">Booking details</p>
                <span className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ background: cfg.badge.bg, color: cfg.badge.text }}>
                  {booking.status}
                </span>
              </div>
              <InfoRow label="Reference"   value={booking.pnr} />
              <InfoRow label="Flight"      value={`${booking.airline} ${booking.flightNo}`} />
              <InfoRow label="Date"        value={booking.date} />
              <InfoRow label="Route"       value={`${booking.from} → ${booking.to}`} />
              <InfoRow label="Departure"   value={booking.departTime} />
              <InfoRow label="Arrival"     value={booking.arrivalTime} />
              <InfoRow label="Cabin"       value={booking.cabin} />
              {booking.seatInfo && <InfoRow label="Seat" value={booking.seatInfo} />}
              <InfoRow label="Fare paid"   value={`₹${booking.fare?.toLocaleString("en-IN")}`} />
            </div>

            {/* Passengers */}
            {booking.passengers?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Passengers</p>
                {booking.passengers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-b-0">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.age} yrs · {p.gender}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: cfg.badge.bg, color: cfg.badge.text }}>
                      {p.seat || booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate("/flights/confirmation", {
                state: {
                  booking,
                  flight: { airline: booking.airline, flightNo: booking.flightNo, departTime: booking.departTime, arrivalTime: booking.arrivalTime, duration: booking.duration, stops: booking.stops },
                  search: { from: booking.from, to: booking.to, date: booking.date, cabin: booking.cabin, passengers: booking.passengers?.length || 1 }
                }
              })}
              className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 flex items-center justify-center gap-2 bg-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download boarding pass
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FlightPNRStatus;