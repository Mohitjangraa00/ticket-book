import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { searchTrains } from "../../services/trainServices";
import { stations } from "../../data/stations";
import useVoiceSearch from "../../hooks/useVoiceSearch";
import { parseVoiceTranscript } from "../../hooks/useVoiceSearch";

const CLASSES = [
  { value: "SL", label: "Sleeper (SL)" },
  { value: "3A", label: "AC 3 Tier (3A)" },
  { value: "2A", label: "AC 2 Tier (2A)" },
  { value: "1A", label: "AC First Class (1A)" },
  { value: "CC", label: "Chair Car (CC)" },
];

const POPULAR_ROUTES = [
  { from: "NDLS", fromName: "New Delhi",   to: "MMCT", toName: "Mumbai Central" },
  { from: "CDG",  fromName: "Chandigarh",  to: "NDLS", toName: "New Delhi" },
  { from: "NDLS", fromName: "New Delhi",   to: "SBC",  toName: "Bengaluru City" },
  { from: "CSTM", fromName: "Mumbai CST",  to: "PUNE", toName: "Pune Junction" },
];

const FieldLabel = ({ children }) => (
  <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">{children}</p>
);

const inputBase =
  "w-full pl-9 pr-3 py-3 text-sm font-medium border rounded-xl outline-none transition-all " +
  "placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800";

const TrainSearch = () => {
  const navigate = useNavigate();

  const [form, setForm]                   = useState({ from: "", to: "", date: "", classType: "SL" });
  const [fromDisplay, setFromDisplay]     = useState("");
  const [toDisplay, setToDisplay]         = useState("");
  const [fromSuggestions, setFromSugg]   = useState([]);
  const [toSuggestions, setToSugg]       = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [voiceHint, setVoiceHint]         = useState("");

  const filterStations = (val) =>
    stations
      .filter(
        (s) =>
          s.code.toLowerCase().includes(val.toLowerCase()) ||
          s.name.toLowerCase().includes(val.toLowerCase()) ||
          (s.city && s.city.toLowerCase().includes(val.toLowerCase()))
      )
      .slice(0, 6);

  /* ─── Voice search ─── */
  const { listening, startListening, stopListening, supported } = useVoiceSearch((transcript) => {
    setVoiceHint(`Heard: "${transcript}"`);
    const parsed = parseVoiceTranscript(transcript, stations);

    if (parsed.from) {
      setForm((f) => ({ ...f, from: parsed.from.code }));
      setFromDisplay(`${parsed.from.code} – ${parsed.from.name}`);
    }
    if (parsed.to) {
      setForm((f) => ({ ...f, to: parsed.to.code }));
      setToDisplay(`${parsed.to.code} – ${parsed.to.name}`);
    }
    if (parsed.classType) setForm((f) => ({ ...f, classType: parsed.classType }));
    if (parsed.date)      setForm((f) => ({ ...f, date: parsed.date }));

    // Clear hint after 3s
    setTimeout(() => setVoiceHint(""), 3000);
  });

  /* ─── Autocomplete ─── */
  const handleFromChange = (val) => {
    setFromDisplay(val);
    setForm((f) => ({ ...f, from: "" }));
    setFromSugg(val ? filterStations(val) : []);
  };

  const handleToChange = (val) => {
    setToDisplay(val);
    setForm((f) => ({ ...f, to: "" }));
    setToSugg(val ? filterStations(val) : []);
  };

  const selectFrom = (s) => {
    setForm((f) => ({ ...f, from: s.code }));
    setFromDisplay(`${s.code} – ${s.name}`);
    setFromSugg([]);
  };

  const selectTo = (s) => {
    setForm((f) => ({ ...f, to: s.code }));
    setToDisplay(`${s.code} – ${s.name}`);
    setToSugg([]);
  };

  const swapStations = () => {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
    setFromDisplay(toDisplay);
    setToDisplay(fromDisplay);
  };

  const setPopularRoute = (route) => {
    setForm((f) => ({ ...f, from: route.from, to: route.to }));
    setFromDisplay(`${route.from} – ${route.fromName}`);
    setToDisplay(`${route.to} – ${route.toName}`);
  };

  /* ─── Search ─── */
  const handleSearch = async () => {
    setError("");
    if (!form.from || !form.to || !form.date) {
      setError("Please select origin, destination and travel date.");
      return;
    }
    if (form.from === form.to) {
      setError("Origin and destination cannot be the same.");
      return;
    }
    setLoading(true);
    try {
      const result = await searchTrains(form);
      navigate("/trains/list", { state: { trains: result.trains, search: form } });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const dropItem =
    "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero */}
      <div
        className="relative overflow-hidden pb-16 pt-5 px-5"
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
          Dashboard
        </button>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-5 h-5">
                <path d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
                <path d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
                <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-white">Train search</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Find & book train tickets</p>
            </div>
          </div>

          {/* Voice search button */}
          {supported && (
            <button
              onClick={listening ? stopListening : startListening}
              title={listening ? "Stop listening" : "Search by voice"}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{
                background: listening ? "rgba(229,62,62,0.25)" : "rgba(255,255,255,0.15)",
                border: listening ? "1.5px solid rgba(229,62,62,0.6)" : "1.5px solid rgba(255,255,255,0.2)",
              }}
            >
              {listening ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2" className="w-5 h-5 animate-pulse">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" className="w-5 h-5">
                  <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                  <path d="M19 10v2a7 7 0 01-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Voice hint */}
        {(listening || voiceHint) && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mt-3 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}
          >
            {listening
              ? 'Listening... say "Delhi to Mumbai sleeper"'
              : voiceHint}
          </motion.div>
        )}
      </div>

      {/* Body */}
      <div className="px-4 pb-8 -mt-8">

        {/* Search card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-3"
        >
          {/* Route */}
          <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: "1fr 36px 1fr" }}>

            {/* From */}
            <div className="relative">
              <FieldLabel> From 
                
              </FieldLabel>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
                </svg>
                <input type="text" placeholder="City or station" value={fromDisplay}
                  onChange={(e) => handleFromChange(e.target.value)}
                  onBlur={() => setTimeout(() => setFromSugg([]), 180)}
                  className={inputBase} autoComplete="off" />
              </div>
              {fromSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {fromSuggestions.map((s) => (
                    <div key={s.code} onMouseDown={() => selectFrom(s)} className={dropItem}>
                      <span className="text-sm font-medium text-gray-800 w-10 flex-shrink-0">{s.code}</span>
                      <span className="text-xs text-gray-400 truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap */}
            <button onClick={swapStations}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center mt-7 hover:border-blue-400 hover:bg-blue-50 transition-all">
              <svg viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>

            {/* To */}
            <div className="relative">
              <FieldLabel>To</FieldLabel>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
                <input type="text" placeholder="City or station" value={toDisplay}
                  onChange={(e) => handleToChange(e.target.value)}
                  onBlur={() => setTimeout(() => setToSugg([]), 180)}
                  className={inputBase} autoComplete="off" />
              </div>
              {toSuggestions.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {toSuggestions.map((s) => (
                    <div key={s.code} onMouseDown={() => selectTo(s)} className={dropItem}>
                      <span className="text-sm font-medium text-gray-800 w-10 flex-shrink-0">{s.code}</span>
                      <span className="text-xs text-gray-400 truncate">{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date + Class */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Date of journey</FieldLabel>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <input type="date" min={today} value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputBase} />
              </div>
            </div>
            <div>
              <FieldLabel>Travel class</FieldLabel>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                  <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                </svg>
                <select value={form.classType}
                  onChange={(e) => setForm((f) => ({ ...f, classType: e.target.value }))}
                  className={inputBase}>
                  {CLASSES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          onClick={handleSearch}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60 mb-5"
          style={{ background: "#185FA5" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
              </svg>
              Searching trains...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search trains
            </>
          )}
        </motion.button>

        {/* Popular routes */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2.5">Popular routes</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROUTES.map((route) => (
              <button key={`${route.from}-${route.to}`} onClick={() => setPopularRoute(route)}
                className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all bg-white">
                {route.fromName} → {route.toName}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TrainSearch;
