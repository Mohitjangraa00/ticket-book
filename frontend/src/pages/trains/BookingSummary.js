import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { bookTrain } from "../../services/trainServices";

const BookingSummary = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { train, search, fare, passengers, contact } = state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  if (!train) {
    navigate("/trains");
    return null;
  }

  const baseFare       = fare * passengers.length;
  const reservation    = 40 * passengers.length;
  const gst            = Math.round((baseFare + reservation) * 0.05);
  const total          = baseFare + reservation + gst;

  const handlePayAndConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await bookTrain({
        trainNo:   train.TrainNo || train.number,
        trainName: train.TrainName || train.name,
        from:      search.from,
        to:        search.to,
        date:      search.date,
        classType: search.classType,
        passengers,
        contact,
        fare:      total,
      });

      if (result.success) {
        navigate("/trains/confirmation", { state: { booking: result.booking, train, search } });
      } else {
        setError(result.message || "Booking failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Row = ({ label, value, bold }) => (
    <div className={`flex justify-between items-center py-2.5 border-b border-gray-50 ${bold ? "border-b-0 pt-3" : ""}`}>
      <span className={`text-sm ${bold ? "font-medium text-gray-800" : "text-gray-500"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-medium text-gray-800 text-base" : "text-gray-700"}`}>{value}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden pb-14 pt-5 px-5"
        style={{
          background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 55%, #185FA5 100%)",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <button onClick={() => navigate(-1)}
          className="relative flex items-center gap-1.5 mb-5 text-sm"
          style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Passenger details
        </button>
        <p className="relative text-white text-lg font-medium">Booking summary</p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          Review before paying
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Train card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-gray-800">{train.TrainName || train.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">#{train.TrainNo || train.number} · {search.classType}</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-800">
              {search.date}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-800">{train.departTime || "—"}</p>
              <p className="text-xs text-gray-400">{search.from}</p>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1 mx-4">
              <p className="text-xs text-gray-400">{train.duration || "—"}</p>
              <div className="w-full h-px bg-gray-200" />
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-gray-800">{train.arrivalTime || "—"}</p>
              <p className="text-xs text-gray-400">{search.to}</p>
            </div>
          </div>
        </div>

        {/* Passengers */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">
            Passengers ({passengers.length})
          </p>
          {passengers.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.age} yrs · {p.gender} · {p.berth}</p>
              </div>
              <p className="text-xs text-gray-500">{p.idType}</p>
            </div>
          ))}
        </div>

        {/* Fare breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Fare breakdown</p>
          <Row label={`Base fare × ${passengers.length}`} value={`₹${baseFare.toLocaleString("en-IN")}`} />
          <Row label="Reservation charge" value={`₹${reservation.toLocaleString("en-IN")}`} />
          <Row label="GST (5%)" value={`₹${gst.toLocaleString("en-IN")}`} />
          <div className="border-t border-gray-100 mt-1">
            <Row label="Total amount" value={`₹${total.toLocaleString("en-IN")}`} bold />
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Ticket will be sent to</p>
          <p className="text-sm text-gray-700">{contact.email}</p>
          <p className="text-sm text-gray-500 mt-0.5">{contact.phone}</p>
        </div>

        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handlePayAndConfirm}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
          style={{ background: "#3B6D11" }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
              </svg>
              Processing payment...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Pay ₹{total.toLocaleString("en-IN")} & confirm
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default BookingSummary;
