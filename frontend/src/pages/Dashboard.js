import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TRANSPORT = [
  {
    title: "Flights",
    path: "/flights",
    accent: { bg: "#E6F1FB", stroke: "#185FA5" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    ),
  },
  {
    title: "Trains",
    path: "/trains",
    accent: { bg: "#EAF3DE", stroke: "#3B6D11" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <path d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
        <path d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    title: "Bus",
    path: "/buses",          // ✅ FIXED: was "/bus", must match App.js route
    accent: { bg: "#FAECE7", stroke: "#993C1D" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="3" y1="11" x2="21" y2="11" />
        <circle cx="7" cy="17" r="1.5" />
        <circle cx="17" cy="17" r="1.5" />
      </svg>
    ),
  },
  {
    title: "Hotels",
    path: "/hotels",
    accent: { bg: "#EEEDFE", stroke: "#534AB7" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <path d="M2 20h20M4 20V10l8-7 8 7v10" />
        <rect x="9" y="14" width="6" height="6" rx="1" />
      </svg>
    ),
  },
];

const ENTERTAINMENT = [
  {
    title: "Movies",
    sub: "Now showing",
    path: "/movies",
    accent: { bg: "#FCEBEB", stroke: "#A32D2D" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <rect x="2" y="2" width="20" height="20" rx="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" />
        <line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
  },
  {
    title: "Events",
    sub: "This weekend",
    path: "/events",
    accent: { bg: "#FBEAF0", stroke: "#993556" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    title: "Sports",
    sub: "Live matches",
    path: "/sports",
    accent: { bg: "#FAEEDA", stroke: "#854F0B" },
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
];

const RECENT_BOOKINGS = [
  {
    title: "Delhi → Mumbai · Flight",
    meta: "15 Apr 2025 · AI-202 · Economy",
    dot: "#185FA5",
    statusLabel: "Confirmed",
    statusBg: "#E6F1FB",
    statusText: "#0C447C",
  },
  {
    title: "Chandigarh → Delhi · Train",
    meta: "12 Apr 2025 · Shatabdi · AC Chair",
    dot: "#3B6D11",
    statusLabel: "Confirmed",
    statusBg: "#EAF3DE",
    statusText: "#27500A",
  },
  {
    title: "IPL 2025 — CSK vs MI",
    meta: "20 Apr 2025 · Wankhede Stadium",
    dot: "#854F0B",
    statusLabel: "Pending",
    statusBg: "#FAEEDA",
    statusText: "#633806",
  },
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const SectionLabel = ({ children }) => (
  <p className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-3 mt-6">
    {children}
  </p>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.name?.split(" ")[0] || "there";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero banner */}
      <div
        className="relative overflow-hidden pb-14 pt-5 px-5"
        style={{
          background: "linear-gradient(135deg, #0f2b5b 0%, #1a4a8a 55%, #185FA5 100%)",
          borderRadius: "0 0 24px 24px",
        }}
      >
        {/* dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* top bar */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" fill="white" />
              </svg>
            </div>
            <span className="text-white text-sm font-medium">Ticket Counter</span>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white"
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1.5px solid rgba(255,255,255,0.35)",
            }}
          >
            {name.slice(0, 2).toUpperCase()}
          </button>
        </div>

        {/* greeting */}
        <p className="relative text-sm mb-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {greeting}, {name}
        </p>
        <p className="relative text-xl font-medium text-white mb-4">
          Where are you headed?
        </p>

        {/* search bar */}
        <div className="relative flex items-center gap-2.5 bg-white rounded-xl px-3.5 py-2.5">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="2"
            className="w-4 h-4 flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search flights, trains, buses..."
            className="flex-1 text-sm outline-none bg-transparent text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      {/* body */}
      <div className="px-5 pb-8 -mt-6">
        {/* Transport cards */}
        <SectionLabel>Book a ticket</SectionLabel>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-4 gap-2.5"
        >
          {TRANSPORT.map((item) => (
            <motion.button
              key={item.title}
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-2xl border border-gray-100 py-3.5 px-2 flex flex-col items-center gap-2 hover:border-gray-300 transition-all"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: item.accent.bg, stroke: item.accent.stroke }}
              >
                <span style={{ stroke: item.accent.stroke, color: item.accent.stroke }}>
                  {item.icon}
                </span>
              </div>
              <span className="text-xs font-medium text-gray-800">{item.title}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Entertainment cards */}
        <SectionLabel>Entertainment & more</SectionLabel>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-2.5"
        >
          {ENTERTAINMENT.map((item) => (
            <motion.button
              key={item.title}
              variants={fadeUp}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(item.path)}
              className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 hover:border-gray-300 transition-all text-left"
            >
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                style={{ background: item.accent.bg }}
              >
                <span style={{ stroke: item.accent.stroke, color: item.accent.stroke }}>
                  {item.icon}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-800 leading-tight">
                  {item.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
              </div>
            </motion.button>
          ))}
          
<button onClick={() => navigate("/trip-planner")}
  className="bg-white rounded-2xl border border-gray-100 p-3.5 flex items-center gap-3 hover:border-gray-300 transition-all">
  <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
    style={{ background: "#EEEDFE" }}>
    <svg viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="1.8" className="w-5 h-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  </div>
  <div>
    <p className="text-xs font-medium text-gray-800">AI trip planner</p>
    <p className="text-xs text-gray-400 mt-0.5">Plan your perfect trip</p>
  </div>
</button>
        </motion.div>

        {/* Recent bookings */}
        <SectionLabel>Recent bookings</SectionLabel>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          {RECENT_BOOKINGS.map((b, i) => (
            <motion.button
              key={i}
              variants={fadeUp}
              onClick={() => navigate("/bookings")}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
              style={{
                borderBottom:
                  i < RECENT_BOOKINGS.length - 1 ? "0.5px solid #f3f4f6" : "none",
              }}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: b.dot }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{b.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{b.meta}</p>
              </div>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
                style={{ background: b.statusBg, color: b.statusText }}
              >
                {b.statusLabel}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;