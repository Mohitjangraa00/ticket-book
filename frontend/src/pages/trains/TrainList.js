import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const STATUS_STYLES = {
  AVAILABLE: { bg: "#EAF3DE", text: "#27500A", label: "Available" },
  WAITING:   { bg: "#FAEEDA", text: "#633806", label: "WL" },
  FULL:      { bg: "#FCEBEB", text: "#791F1F", label: "Full" },
};

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TrainList = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const trains    = state?.trains || [];
  const search    = state?.search || {};

  const [sortBy, setSortBy] = useState("departure"); // departure | duration | price

  const sorted = [...trains].sort((a, b) => {
    if (sortBy === "departure") return a.departTime?.localeCompare(b.departTime);
    if (sortBy === "duration")  return (a.durationMins || 0) - (b.durationMins || 0);
    if (sortBy === "price")     return (a.fare || 0) - (b.fare || 0);
    return 0;
  });

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
          Search
        </button>

        <p className="relative text-white text-lg font-medium">
          {search.from} → {search.to}
        </p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {search.date} · {search.classType} · {trains.length} train{trains.length !== 1 ? "s" : ""} found
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">
        {/* Sort bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-1 mb-3 flex gap-1">
          {[
            { key: "departure", label: "Departure" },
            { key: "duration",  label: "Duration" },
            { key: "price",     label: "Price" },
          ].map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className="flex-1 py-2 text-xs font-medium rounded-xl transition-all"
              style={{
                background: sortBy === s.key ? "#185FA5" : "transparent",
                color: sortBy === s.key ? "white" : "#6b7280",
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {trains.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" className="w-7 h-7">
                <path d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
                <path d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-700">No trains found</p>
            <p className="text-xs text-gray-400">Try a different date or route</p>
            <button onClick={() => navigate(-1)}
              className="mt-2 px-5 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: "#185FA5" }}>
              Modify search
            </button>
          </div>
        ) : (
          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2.5">
            {sorted.map((train, i) => (
              <TrainCard key={i} train={train} search={search} />
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const TrainCard = ({ train, search }) => {
  const navigate = useNavigate();
  const avail    = train.availability || "AVAILABLE";
  const style    = STATUS_STYLES[avail] || STATUS_STYLES.AVAILABLE;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
      className="bg-white rounded-2xl border border-gray-100 p-4"
    >
      {/* Train name + number */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-gray-800">{train.TrainName || train.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">Train #{train.TrainNo || train.number}</p>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full"
          style={{ background: style.bg, color: style.text }}>
          {avail === "WAITING"
            ? `WL/${train.waitingCount || "?"}`
            : style.label}
        </span>
      </div>

      {/* Route + time */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-base font-medium text-gray-800">{train.departTime || "—"}</p>
          <p className="text-xs text-gray-400">{train.FromStationName || search.from}</p>
        </div>
        <div className="flex flex-col items-center gap-1 flex-1 mx-3">
          <p className="text-xs text-gray-400">{train.duration || "—"}</p>
          <div className="w-full h-px bg-gray-200 relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-400" />
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-medium text-gray-800">{train.arrivalTime || "—"}</p>
          <p className="text-xs text-gray-400">{train.ToStationName || search.to}</p>
        </div>
      </div>

      {/* Days */}
      {train.runningDays && (
        <p className="text-xs text-gray-400 mb-3">Runs: {train.runningDays}</p>
      )}

      {/* Price + action */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div>
          <p className="text-lg font-medium" style={{ color: "#185FA5" }}>
            ₹{train.fare?.toLocaleString("en-IN") || "—"}
          </p>
          <p className="text-xs text-gray-400">{search.classType}</p>
        </div>
        <button
          onClick={() =>
            navigate("/trains/details", {
              state: { train, search },
            })
          }
          disabled={avail === "FULL"}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-40 transition-all"
          style={{ background: avail === "WAITING" ? "#854F0B" : "#185FA5" }}
        >
          {avail === "WAITING" ? "Join waitlist" : "View seats"}
        </button>
      </div>
    </motion.div>
  );
};

export default TrainList;
