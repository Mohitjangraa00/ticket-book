import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import api from "../services/api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ─── Status config ─── */
const STATUS = {
  CONFIRMED: { bg: "#EAF3DE", text: "#27500A", label: "Confirmed" },
  WAITING:   { bg: "#FAEEDA", text: "#633806", label: "Waiting" },
  CANCELLED: { bg: "#FCEBEB", text: "#791F1F", label: "Cancelled" },
};

/* ─── Type config ─── */
const TYPE_STYLE = {
  train:  { bg: "#EAF3DE", stroke: "#3B6D11" },
  flight: { bg: "#E6F1FB", stroke: "#185FA5" },
  bus:    { bg: "#FAEEDA", stroke: "#854F0B" },
};

/* ─── Icons ─── */
const TrainIcon = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-4 h-4">
    <path d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
    <path d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
  </svg>
);

const FlightIcon = ({ color }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" className="w-4 h-4">
    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
  </svg>
);

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

/* ─── Single booking card ─── */
const BookingCard = ({ booking, onCancel }) => {
  const navigate   = useNavigate();
  const ticketRef  = useRef(null);
  const [cancelling, setCancelling] = useState(false);
  const [expanded, setExpanded]     = useState(false);

  const isType   = booking.type || (booking.flightNo ? "flight" : "train");
  const st       = STATUS[booking.status] || STATUS.CONFIRMED;
  const ts       = TYPE_STYLE[isType] || TYPE_STYLE.train;
  const isCancelled = booking.status === "CANCELLED";

  const downloadPDF = async () => {
    const el = ticketRef.current;
    if (!el) return;
    const canvas  = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf     = new jsPDF("p", "mm", "a4");
    const w       = pdf.internal.pageSize.getWidth();
    const h       = (canvas.height * w) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, w, h);
    pdf.save(`ticket-${booking.pnr}.pdf`);
  };

  const handleCancel = async () => {
    if (!window.confirm("Cancel this booking? Refund will be processed in 5–7 days.")) return;
    setCancelling(true);
    try {
      const endpoint = isType === "flight"
        ? `/flights/cancel/${booking.pnr}`
        : `/trains/cancel/${booking.pnr}`;
      const res = await api.post(endpoint);
      if (res.success) onCancel(booking.pnr, res.refundAmount);
    } catch (e) {
      alert(e.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  };

  const checkStatus = () => {
    if (isType === "flight") navigate("/flights/pnr-status", { state: { pnr: booking.pnr } });
    else navigate("/pnr-status", { state: { pnr: booking.pnr } });
  };

  const viewTicket = () => {
    if (isType === "flight") {
      navigate("/flights/confirmation", {
        state: {
          booking,
          flight: { airline: booking.airline, flightNo: booking.flightNo, departTime: booking.departTime, arrivalTime: booking.arrivalTime, duration: booking.duration, stops: booking.stops },
          search: { from: booking.from, to: booking.to, date: booking.date, cabin: booking.cabin, passengers: booking.passengers?.length || 1 },
        },
      });
    } else {
      navigate("/trains/confirmation", {
        state: {
          booking,
          train: { TrainName: booking.trainName, TrainNo: booking.trainNo, departTime: booking.departTime, arrivalTime: booking.arrivalTime, duration: booking.duration },
          search: { from: booking.from, to: booking.to, date: booking.date, classType: booking.classType },
        },
      });
    }
  };

  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ opacity: isCancelled ? 0.7 : 1 }}>

      {/* Printable area (hidden from view, used for PDF) */}
      <div ref={ticketRef} style={{ position: "absolute", left: -9999, top: -9999, width: 400, padding: 24, background: "white" }}>
        <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
          {isType === "flight" ? `${booking.airline} ${booking.flightNo}` : `${booking.trainName} (${booking.trainNo})`}
        </p>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 16 }}>PNR: {booking.pnr}</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div><p style={{ fontSize: 22, fontWeight: 700 }}>{booking.departTime}</p><p style={{ fontSize: 11, color: "#9ca3af" }}>{booking.from}</p></div>
          <div style={{ textAlign: "right" }}><p style={{ fontSize: 22, fontWeight: 700 }}>{booking.arrivalTime}</p><p style={{ fontSize: 11, color: "#9ca3af" }}>{booking.to}</p></div>
        </div>
        <p style={{ fontSize: 11, color: "#6b7280" }}>Date: {booking.date}</p>
        <p style={{ fontSize: 11, color: "#6b7280" }}>Class: {booking.classType || booking.cabin}</p>
        <p style={{ fontSize: 11, color: "#6b7280" }}>Status: {booking.status}</p>
        {booking.seatInfo && <p style={{ fontSize: 11, color: "#6b7280" }}>Seat: {booking.seatInfo}</p>}
        <p style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}>Fare: ₹{booking.fare?.toLocaleString("en-IN")}</p>
      </div>

      {/* Card header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: ts.bg }}>
              {isType === "flight"
                ? <FlightIcon color={ts.stroke} />
                : <TrainIcon color={ts.stroke} />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">
                {isType === "flight"
                  ? `${booking.airline} · ${booking.flightNo}`
                  : `${booking.trainName}`}
              </p>
              <p className="text-xs text-gray-400">
                {isType === "flight"
                  ? `${booking.cabin || "Economy"} · ${booking.stops || "Non-stop"}`
                  : `#${booking.trainNo} · ${booking.classType}`}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
            style={{ background: st.bg, color: st.text }}>
            {booking.status === "WAITING" ? `WL/${booking.waitingNumber}` : st.label}
          </span>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-lg font-medium text-gray-800">{booking.departTime || "—"}</p>
            <p className="text-xs text-gray-400">{booking.from}</p>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1 mx-3">
            <p className="text-xs text-gray-400">{booking.duration || "—"}</p>
            <div className="w-full h-px bg-gray-200" />
          </div>
          <div className="text-right">
            <p className="text-lg font-medium text-gray-800">{booking.arrivalTime || "—"}</p>
            <p className="text-xs text-gray-400">{booking.to}</p>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#E6F1FB", color: "#0C447C" }}>
              {booking.pnr}
            </span>
            <span className="text-xs text-gray-400">{booking.date}</span>
          </div>
          <p className="text-sm font-medium text-gray-800">
            ₹{booking.fare?.toLocaleString("en-IN")}
          </p>
        </div>

        {/* Expanded seat info */}
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
            {booking.seatInfo && (
              <div><p className="text-xs text-gray-400">Seat / Berth</p><p className="text-xs font-medium text-gray-700">{booking.seatInfo}</p></div>
            )}
            {booking.gate && (
              <div><p className="text-xs text-gray-400">Gate</p><p className="text-xs font-medium text-gray-700">{booking.gate}</p></div>
            )}
            {booking.passengers?.length > 0 && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-1">Passengers</p>
                {booking.passengers.map((p, i) => (
                  <p key={i} className="text-xs text-gray-600">{p.name} · {p.age} yrs · {p.gender}</p>
                ))}
              </div>
            )}
            {isCancelled && booking.refund && (
              <div className="col-span-2 px-3 py-2 rounded-lg" style={{ background: "#EAF3DE" }}>
                <p className="text-xs font-medium" style={{ color: "#27500A" }}>
                  Refund: ₹{booking.refund?.toLocaleString("en-IN")} — processed in 5–7 days
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex gap-2 flex-wrap">
        <button onClick={() => setExpanded(!expanded)}
          className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
          {expanded ? "Less" : "Details"}
        </button>

        {!isCancelled && (
          <>
            <button onClick={viewTicket}
              className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">
              View ticket
            </button>

            <button onClick={downloadPDF}
              className="px-3 py-1.5 rounded-lg text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              PDF
            </button>

            <button onClick={checkStatus}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-white flex items-center gap-1"
              style={{ background: "#185FA5" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3 h-3">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {isType === "flight" ? "Flight status" : "Check PNR"}
            </button>

            <button onClick={handleCancel} disabled={cancelling}
              className="px-3 py-1.5 rounded-lg text-xs border text-red-500 border-red-100 hover:bg-red-50 transition-all disabled:opacity-50 ml-auto">
              {cancelling ? "Cancelling..." : "Cancel"}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

/* ─── Main MyBookings page ─── */
const MyBookings = () => {
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [filter, setFilter]           = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const [trainRes, flightRes] = await Promise.all([
        api.get("/trains/my-bookings"),
        api.get("/flights/my-bookings"),
      ]);

      const trains  = (trainRes.bookings  || []).map((b) => ({ ...b, type: "train" }));
      const flights = (flightRes.bookings || []).map((b) => ({ ...b, type: "flight" }));

      // Merge and sort by most recent first
      const merged = [...trains, ...flights].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setAllBookings(merged);
    } catch (e) {
      setError("Could not load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (pnr, refundAmount) => {
    setAllBookings((prev) =>
      prev.map((b) =>
        b.pnr === pnr ? { ...b, status: "CANCELLED", refund: refundAmount } : b
      )
    );
  };

  const filtered = allBookings.filter((b) => {
    if (filter === "all")       return true;
    if (filter === "upcoming")  return b.status !== "CANCELLED" && new Date(b.date) >= new Date();
    if (filter === "trains")    return b.type === "train";
    if (filter === "flights")   return b.type === "flight";
    if (filter === "cancelled") return b.status === "CANCELLED";
    return true;
  });

  const total     = allBookings.length;
  const upcoming  = allBookings.filter((b) => b.status !== "CANCELLED" && new Date(b.date) >= new Date()).length;
  const cancelled = allBookings.filter((b) => b.status === "CANCELLED").length;

  const FILTERS = [
    { key: "all",       label: "All" },
    { key: "upcoming",  label: "Upcoming" },
    { key: "trains",    label: "Trains" },
    { key: "flights",   label: "Flights" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative overflow-hidden pb-14 pt-5 px-5"
        style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 55%, #185FA5 100%)", borderRadius: "0 0 24px 24px" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <button onClick={() => navigate(-1)} className="relative flex items-center gap-1.5 mb-5 text-sm"
          style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>
        <p className="relative text-white text-lg font-medium">My bookings</p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          All your tickets in one place
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-2.5 mb-3">
          {[
            { num: total,     label: "Total" },
            { num: upcoming,  label: "Upcoming" },
            { num: cancelled, label: "Cancelled" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 py-3.5 text-center">
              <p className="text-xl font-medium text-gray-800">{s.num}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Filter tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1 mb-3 flex gap-1 overflow-x-auto">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
              style={{
                background: filter === f.key ? "#185FA5" : "transparent",
                color:      filter === f.key ? "white"   : "#6b7280",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
            </svg>
            <p className="text-sm text-gray-400">Loading your bookings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 w-full">
              <p className="text-xs text-red-600 text-center">{error}</p>
            </div>
            <button onClick={fetchBookings}
              className="px-5 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "#185FA5" }}>
              Try again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-8 h-8">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No bookings found</p>
            <p className="text-xs text-gray-400">
              {filter === "all" ? "Your booked tickets will appear here" : `No ${filter} bookings`}
            </p>
            <button onClick={() => navigate("/dashboard")}
              className="mt-1 px-5 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "#185FA5" }}>
              Book a ticket
            </button>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
            {filtered.map((booking) => (
              <BookingCard key={booking.pnr} booking={booking} onCancel={handleCancel} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default MyBookings;