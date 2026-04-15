import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PricePredictor from "../../components/PricePredictor";
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

const STOP_STYLE = {
  "Non-stop": { bg: "#EAF3DE", text: "#27500A" },
  "1 stop":   { bg: "#FAEEDA", text: "#633806" },
  "2 stops":  { bg: "#FCEBEB", text: "#791F1F" },
};

const FlightCard = ({ flight, search }) => {
  const navigate = useNavigate();
  const st = STOP_STYLE[flight.stops] || STOP_STYLE["Non-stop"];

  return (
    <motion.div variants={fadeUp}
      className="bg-white rounded-2xl border border-gray-100 p-4">
      {/* Airline + flight number */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium"
            style={{ background: "#E6F1FB", color: "#0C447C" }}>
            {flight.airlineCode}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{flight.airline}</p>
            <p className="text-xs text-gray-400">{flight.flightNo}</p>
          </div>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: st.bg, color: st.text }}>
          {flight.stops}
        </span>
      </div>

      {/* Route + time */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xl font-medium text-gray-800">{flight.departTime}</p>
          <p className="text-xs text-gray-400">{flight.from}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1 mx-3">
          <p className="text-xs text-gray-400">{flight.duration}</p>
          <div className="w-full h-px bg-gray-200 relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.5"
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white">
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          {flight.stopCity && (
            <p className="text-xs text-amber-600">via {flight.stopCity}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-medium text-gray-800">{flight.arrivalTime}</p>
          <p className="text-xs text-gray-400">{flight.to}</p>
        </div>
      </div>

      {/* Amenities */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {flight.amenities?.map((a) => (
          <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
            {a}
          </span>
        ))}
      </div>

      {/* Price + action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-xl font-medium" style={{ color: "#185FA5" }}>
            ₹{flight.fare?.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-gray-400">per person · {search.cabin}</p>
        </div>
        <button
          onClick={() => navigate("/flights/details", { state: { flight, search } })}
          className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
          style={{ background: "#185FA5" }}>
          Select
        </button>
      </div>
    </motion.div>
  );
};

const FlightResults = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const flights    = state?.flights || [];
  const search     = state?.search  || {};

  const [sortBy, setSortBy]     = useState("price");
  const [stopFilter, setFilter] = useState("all");

  const filtered = flights
    .filter((f) => stopFilter === "all" || f.stops === stopFilter)
    .sort((a, b) => {
      if (sortBy === "price")     return (a.fare || 0) - (b.fare || 0);
      if (sortBy === "duration")  return (a.durationMins || 0) - (b.durationMins || 0);
      if (sortBy === "departure") return a.departTime?.localeCompare(b.departTime);
      return 0;
    });

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
          Search
        </button>
        <p className="relative text-white text-lg font-medium">{search.from} → {search.to}</p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {search.date} · {search.passengers} {search.passengers === 1 ? "passenger" : "passengers"} · {search.cabin} · {flights.length} flights
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Sort + filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-3 flex gap-2 overflow-x-auto">
          {[
            { key: "price",     label: "Cheapest" },
            { key: "duration",  label: "Fastest" },
            { key: "departure", label: "Earliest" },
          ].map((s) => (
            <button key={s.key} onClick={() => setSortBy(s.key)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
              style={{ background: sortBy === s.key ? "#185FA5" : "transparent", color: sortBy === s.key ? "white" : "#6b7280" }}>
              {s.label}
            </button>
          ))}
          <div className="w-px bg-gray-100 mx-1 flex-shrink-0" />
          {["all", "Non-stop", "1 stop"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
              style={{ background: stopFilter === f ? "#EAF3DE" : "transparent", color: stopFilter === f ? "#27500A" : "#6b7280" }}>
              {f === "all" ? "All stops" : f}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-7 h-7">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No flights found</p>
            <p className="text-xs text-gray-400">Try different filters or dates</p>
            <button onClick={() => navigate(-1)}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "#185FA5" }}>
              Modify search
            </button>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
            {filtered.map((f, i) => (
              <FlightCard key={i} flight={f} search={search} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default FlightResults;