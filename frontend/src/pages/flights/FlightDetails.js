import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getFlightDetails } from "../../services/Flightservices";

const CABIN_INFO = {
  economy:  { label: "Economy",     icon: "✦", desc: "Standard seat · 24kg baggage · In-flight meal" },
  business: { label: "Business",    icon: "✦✦", desc: "Lie-flat seat · 32kg baggage · Lounge access" },
  first:    { label: "First class", icon: "✦✦✦", desc: "Private suite · 40kg baggage · Priority services" },
};

const FlightDetails = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { flight, search } = state || {};

  const [cabins, setCabins]     = useState([]);
  const [selected, setSelected] = useState(search?.cabin || "economy");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (!flight) { navigate("/flights"); return; }
    (async () => {
      try {
        const data = await getFlightDetails(
          flight.flightId || flight.flightNo,
          search.date, search.passengers, search.cabin
        );
        setCabins(data.cabins || []);
        const match = data.cabins?.find((c) => c.type === search.cabin);
        if (match) setSelected(match.type);
      } catch {
        setError("Could not load cabin details. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedCabin = cabins.find((c) => c.type === selected);
  const info = CABIN_INFO[selected] || CABIN_INFO.economy;

  const statusStyle = (avail, wl) => {
    if (wl > 0)    return { bg: "#FAEEDA", text: "#633806", label: `${avail} seats left` };
    if (avail > 0) return { bg: "#EAF3DE", text: "#27500A", label: `${avail} seats` };
    return { bg: "#FCEBEB", text: "#791F1F", label: "Sold out" };
  };

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
          Flights
        </button>
        <p className="relative text-white text-lg font-medium">{flight?.airline} · {flight?.flightNo}</p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {flight?.from} → {flight?.to} · {flight?.departTime} – {flight?.arrivalTime} · {flight?.duration}
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Journey summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-medium text-gray-800">{flight?.departTime}</p>
              <p className="text-xs text-gray-400">{flight?.from} · {search?.date}</p>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1 mx-4">
              <p className="text-xs text-gray-400">{flight?.duration}</p>
              <div className="w-full h-px bg-gray-200" />
              <p className="text-xs text-gray-400">{flight?.stops}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-medium text-gray-800">{flight?.arrivalTime}</p>
              <p className="text-xs text-gray-400">{flight?.to}</p>
            </div>
          </div>
        </div>

        {/* Cabin cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
            </svg>
          </div>
        ) : error ? (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 mb-3">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        ) : (
          <motion.div initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="space-y-2.5 mb-3">
            {cabins.map((cab) => {
              const i = CABIN_INFO[cab.type] || {};
              const st = statusStyle(cab.available, 0);
              const isSel = selected === cab.type;

              return (
                <motion.button key={cab.type}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.28 } } }}
                  onClick={() => cab.available > 0 ? setSelected(cab.type) : null}
                  className="w-full text-left bg-white rounded-2xl p-4 transition-all"
                  style={{
                    border:   isSel ? "2px solid #185FA5" : "0.5px solid #f3f4f6",
                    opacity:  cab.available === 0 ? 0.5 : 1,
                  }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{i.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{i.desc}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                      style={{ background: st.bg, color: st.text }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Amenity chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {cab.amenities?.map((a) => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">{a}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium" style={{ color: "#185FA5" }}>
                      ₹{cab.fare?.toLocaleString("en-IN")} <span className="text-xs text-gray-400 font-normal">per person</span>
                    </p>
                    {isSel && (
                      <div className="flex items-center gap-1 text-xs" style={{ color: "#185FA5" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}

        {selectedCabin && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate("/flights/passengers", {
              state: { flight, search: { ...search, cabin: selected }, fare: selectedCabin.fare }
            })}
            className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
            style={{ background: "#185FA5" }}>
            Book {CABIN_INFO[selected]?.label} · ₹{(selectedCabin.fare * search.passengers)?.toLocaleString("en-IN")}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default FlightDetails;