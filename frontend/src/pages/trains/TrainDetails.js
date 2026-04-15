import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getTrainDetails } from "../../services/trainServices";

const CLASS_INFO = {
  SL:  { label: "Sleeper",         desc: "Non-AC, side/lower/upper berths" },
  "3A":{ label: "AC 3 Tier",       desc: "AC, 3-tier berths" },
  "2A":{ label: "AC 2 Tier",       desc: "AC, 2-tier berths, curtains" },
  "1A":{ label: "AC First Class",  desc: "AC, private cabins, 4 berths" },
  CC:  { label: "Chair Car",       desc: "Reclining seats, day trains" },
};

const TrainDetails = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { train, search } = state || {};

  const [classes, setClasses]     = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    if (!train) { navigate("/trains"); return; }
    (async () => {
      try {
        const data = await getTrainDetails(
          train.TrainNo || train.number,
          search.from,
          search.to,
          search.date
        );
        setClasses(data.classes || []);
        // Pre-select the class the user searched for
        const match = data.classes?.find((c) => c.type === search.classType);
        if (match) setSelected(match.type);
      } catch {
        setError("Could not load seat availability. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedClass = classes.find((c) => c.type === selected);

  const statusStyle = (avail, wl) => {
    if (wl > 0) return { bg: "#FAEEDA", text: "#633806", label: `WL/${wl}` };
    if (avail > 0) return { bg: "#EAF3DE", text: "#27500A", label: `${avail} avbl` };
    return { bg: "#FCEBEB", text: "#791F1F", label: "Full" };
  };

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
          Train list
        </button>
        <p className="relative text-white text-lg font-medium">
          {train?.TrainName || train?.name}
        </p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          #{train?.TrainNo || train?.number} · {search?.from} → {search?.to} · {search?.date}
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Journey summary card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-medium text-gray-800">{train?.departTime || "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{search?.from}</p>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1 mx-4">
              <p className="text-xs text-gray-400">{train?.duration || "—"}</p>
              <div className="w-full h-px bg-gray-200" />
            </div>
            <div className="text-right">
              <p className="text-xl font-medium text-gray-800">{train?.arrivalTime || "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">{search?.to}</p>
            </div>
          </div>
        </div>

        {/* Class cards */}
        {loading ? (
          <div className="flex justify-center py-12">
            <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
            </svg>
          </div>
        ) : error ? (
          <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07 } } }}
            className="space-y-2.5 mb-3"
          >
            {classes.map((cls) => {
              const info   = CLASS_INFO[cls.type] || { label: cls.type, desc: "" };
              const st     = statusStyle(cls.available, cls.waitingList);
              const isSelected = selected === cls.type;

              return (
                <motion.button
                  key={cls.type}
                  variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }}
                  onClick={() => cls.available > 0 || cls.waitingList > 0 ? setSelected(cls.type) : null}
                  className="w-full text-left bg-white rounded-2xl p-4 transition-all"
                  style={{
                    border: isSelected ? "2px solid #185FA5" : "0.5px solid #f3f4f6",
                    opacity: cls.available === 0 && cls.waitingList === 0 ? 0.5 : 1,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{info.label} ({cls.type})</p>
                      <p className="text-xs text-gray-400 mt-0.5">{info.desc}</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ background: st.bg, color: st.text }}>
                      {st.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-base font-medium" style={{ color: "#185FA5" }}>
                      ₹{cls.fare?.toLocaleString("en-IN") || "—"}
                    </p>
                    {isSelected && (
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

        {/* Book button */}
        {selectedClass && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() =>
              navigate("/trains/passengers", {
                state: { train, search: { ...search, classType: selected }, fare: selectedClass.fare },
              })
            }
            className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
            style={{
              background: selectedClass.waitingList > 0 ? "#854F0B" : "#185FA5",
            }}
          >
            {selectedClass.waitingList > 0
              ? `Join Waitlist · WL/${selectedClass.waitingList}`
              : `Book ${CLASS_INFO[selected]?.label || selected} · ₹${selectedClass.fare?.toLocaleString("en-IN")}`}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default TrainDetails;
