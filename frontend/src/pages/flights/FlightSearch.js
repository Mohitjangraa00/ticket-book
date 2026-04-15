import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { searchFlights } from "../../services/Flightservices";
import { airports } from "../../data/Airports";
import useVoiceSearch, { parseVoiceTranscript } from "../../hooks/useVoiceSearch";

const CABINS = [
  { value: "economy",  label: "Economy" },
  { value: "business", label: "Business" },
  { value: "first",    label: "First class" },
];

const POPULAR_ROUTES = [
  { from: "DEL", fromCity: "Delhi",     to: "BOM", toCity: "Mumbai" },
  { from: "BOM", fromCity: "Mumbai",    to: "BLR", toCity: "Bengaluru" },
  { from: "DEL", fromCity: "Delhi",     to: "GOI", toCity: "Goa" },
  { from: "BLR", fromCity: "Bengaluru", to: "HYD", toCity: "Hyderabad" },
];

const FieldLabel = ({ children }) => (
  <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1.5">{children}</p>
);

const inputBase =
  "w-full pl-9 pr-3 py-3 text-sm font-medium border rounded-xl outline-none transition-all " +
  "placeholder-gray-400 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800";

const FlightSearch = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    from: "", to: "", date: "",
    returnDate: "", passengers: 1, cabin: "economy", tripType: "one-way",
  });
  const [fromDisplay, setFromDisplay] = useState("");
  const [toDisplay, setToDisplay]     = useState("");
  const [fromSugg, setFromSugg]       = useState([]);
  const [toSugg, setToSugg]           = useState([]);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [voiceHint, setVoiceHint]     = useState("");

  const filterAirports = (val) =>
    airports
      .filter(
        (a) =>
          a.code.toLowerCase().includes(val.toLowerCase()) ||
          a.name.toLowerCase().includes(val.toLowerCase()) ||
          a.city.toLowerCase().includes(val.toLowerCase())
      )
      .slice(0, 6);

  /* ── Voice search ── */
  const { listening, startListening, stopListening, supported } = useVoiceSearch((transcript) => {
    setVoiceHint(`Heard: "${transcript}"`);
    const lower = transcript.toLowerCase();

    const routeMatch = lower.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s+on|\s+for|\s+economy|\s+business|\s+first|$)/);
    if (routeMatch) {
      const fromA = airports.find((a) => a.city.toLowerCase().includes(routeMatch[1].trim()));
      const toA   = airports.find((a) => a.city.toLowerCase().includes(routeMatch[2].trim()));
      if (fromA) { setForm((f) => ({ ...f, from: fromA.code })); setFromDisplay(`${fromA.code} — ${fromA.city}`); }
      if (toA)   { setForm((f) => ({ ...f, to: toA.code }));     setToDisplay(`${toA.code} — ${toA.city}`); }
    }
    if (lower.includes("business")) setForm((f) => ({ ...f, cabin: "business" }));
    if (lower.includes("first"))    setForm((f) => ({ ...f, cabin: "first" }));

    const today = new Date();
    if (lower.includes("tomorrow")) {
      today.setDate(today.getDate() + 1);
      setForm((f) => ({ ...f, date: today.toISOString().split("T")[0] }));
    }
    setTimeout(() => setVoiceHint(""), 3000);
  });

  const selectFrom = (a) => { setForm((f) => ({ ...f, from: a.code })); setFromDisplay(`${a.code} — ${a.city}`); setFromSugg([]); };
  const selectTo   = (a) => { setForm((f) => ({ ...f, to: a.code }));   setToDisplay(`${a.code} — ${a.city}`);   setToSugg([]); };

  const swapAirports = () => {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
    setFromDisplay(toDisplay);
    setToDisplay(fromDisplay);
  };

  const setPopularRoute = (r) => {
    setForm((f) => ({ ...f, from: r.from, to: r.to }));
    setFromDisplay(`${r.from} — ${r.fromCity}`);
    setToDisplay(`${r.to} — ${r.toCity}`);
  };

  const handleSearch = async () => {
    setError("");
    if (!form.from || !form.to || !form.date) { setError("Please select origin, destination and date."); return; }
    if (form.from === form.to)                 { setError("Origin and destination cannot be the same."); return; }
    if (form.tripType === "round-trip" && !form.returnDate) { setError("Please select a return date."); return; }
    setLoading(true);
    try {
      const result = await searchFlights(form);
      navigate("/flights/results", { state: { flights: result.flights, search: form } });
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const dropItem = "flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative overflow-hidden pb-16 pt-5 px-5"
        style={{ background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 55%, #185FA5 100%)", borderRadius: "0 0 24px 24px" }}>
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
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-5 h-5">
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-white">Flight search</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Find & book flights</p>
            </div>
          </div>

          {supported && (
            <button onClick={listening ? stopListening : startListening}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: listening ? "rgba(229,62,62,0.25)" : "rgba(255,255,255,0.15)", border: listening ? "1.5px solid rgba(229,62,62,0.6)" : "1.5px solid rgba(255,255,255,0.2)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={listening ? "#fca5a5" : "rgba(255,255,255,0.85)"}
                strokeWidth="1.8" className={`w-5 h-5 ${listening ? "animate-pulse" : ""}`}>
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
                <path d="M19 10v2a7 7 0 01-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
        </div>

        {(listening || voiceHint) && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="relative mt-3 px-3 py-2 rounded-xl text-xs"
            style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
            {listening ? 'Listening... say "Delhi to Mumbai economy tomorrow"' : voiceHint}
          </motion.div>
        )}
      </div>

      <div className="px-4 pb-8 -mt-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-5 mb-3">

          {/* Trip type tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
            {["one-way", "round-trip"].map((t) => (
              <button key={t} onClick={() => setForm((f) => ({ ...f, tripType: t }))}
                className="flex-1 py-2 text-xs font-medium rounded-lg transition-all"
                style={{ background: form.tripType === t ? "white" : "transparent", color: form.tripType === t ? "#111827" : "#6b7280" }}>
                {t === "one-way" ? "One way" : "Round trip"}
              </button>
            ))}
          </div>

          {/* Route row */}
          <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: "1fr 36px 1fr" }}>
            {/* From */}
            <div className="relative">
              <FieldLabel>From</FieldLabel>
              <div className="relative">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <input type="text" placeholder="City or airport" value={fromDisplay}
                  onChange={(e) => { setFromDisplay(e.target.value); setForm((f) => ({ ...f, from: "" })); setFromSugg(filterAirports(e.target.value)); }}
                  onBlur={() => setTimeout(() => setFromSugg([]), 180)}
                  className={inputBase} autoComplete="off" />
              </div>
              {fromSugg.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {fromSugg.map((a) => (
                    <div key={a.code} onMouseDown={() => selectFrom(a)} className={dropItem}>
                      <span className="text-sm font-medium text-gray-800 w-10 flex-shrink-0">{a.code}</span>
                      <span className="text-xs text-gray-400 truncate">{a.city} — {a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Swap */}
            <button onClick={swapAirports}
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
                <input type="text" placeholder="City or airport" value={toDisplay}
                  onChange={(e) => { setToDisplay(e.target.value); setForm((f) => ({ ...f, to: "" })); setToSugg(filterAirports(e.target.value)); }}
                  onBlur={() => setTimeout(() => setToSugg([]), 180)}
                  className={inputBase} autoComplete="off" />
              </div>
              {toSugg.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl overflow-hidden">
                  {toSugg.map((a) => (
                    <div key={a.code} onMouseDown={() => selectTo(a)} className={dropItem}>
                      <span className="text-sm font-medium text-gray-800 w-10 flex-shrink-0">{a.code}</span>
                      <span className="text-xs text-gray-400 truncate">{a.city} — {a.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Date + return date + passengers + cabin */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <FieldLabel>Departure date</FieldLabel>
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

            {form.tripType === "round-trip" ? (
              <div>
                <FieldLabel>Return date</FieldLabel>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input type="date" min={form.date || today} value={form.returnDate}
                    onChange={(e) => setForm((f) => ({ ...f, returnDate: e.target.value }))}
                    className={inputBase} />
                </div>
              </div>
            ) : (
              <div>
                <FieldLabel>Passengers</FieldLabel>
                <div className="relative">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                  <select value={form.passengers}
                    onChange={(e) => setForm((f) => ({ ...f, passengers: Number(e.target.value) }))}
                    className={inputBase}>
                    {[1,2,3,4,5,6].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? "Adult" : "Adults"}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Cabin class pills */}
          <div>
            <FieldLabel>Cabin class</FieldLabel>
            <div className="flex gap-2">
              {CABINS.map((c) => (
                <button key={c.value} onClick={() => setForm((f) => ({ ...f, cabin: c.value }))}
                  className="px-4 py-2 rounded-xl text-xs font-medium border transition-all"
                  style={{
                    background:   form.cabin === c.value ? "#E6F1FB" : "white",
                    borderColor:  form.cabin === c.value ? "#185FA5" : "#e5e7eb",
                    color:        form.cabin === c.value ? "#0C447C" : "#6b7280",
                  }}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onClick={handleSearch} disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60 mb-5"
          style={{ background: "#185FA5" }} whileTap={{ scale: 0.98 }}>
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
              </svg>
              Searching flights...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search flights
            </>
          )}
        </motion.button>

        {/* Popular routes */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2.5">Popular routes</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_ROUTES.map((r) => (
              <button key={`${r.from}-${r.to}`} onClick={() => setPopularRoute(r)}
                className="px-3 py-1.5 rounded-full text-xs border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all bg-white">
                {r.fromCity} → {r.toCity}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default FlightSearch;