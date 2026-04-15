import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.07 },
  }),
};

const ChevronRight = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className="w-3.5 h-3.5 text-gray-300"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const RowIcon = ({ bg, stroke, children }) => (
  <div
    className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
    style={{ background: bg }}
  >
    <span style={{ stroke, color: stroke }}>{children}</span>
  </div>
);

const ProfileRow = ({ bg, stroke, icon, label, sub, onClick, index }) => (
  <motion.button
    custom={index}
    variants={fadeUp}
    initial="hidden"
    animate="show"
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors text-left"
    style={{ borderBottom: "0.5px solid #f3f4f6" }}
  >
    <RowIcon bg={bg} stroke={stroke}>
      {icon}
    </RowIcon>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
    <ChevronRight />
  </motion.button>
);

const SectionCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">
    {title && (
      <p className="px-4 pt-3 pb-2 text-xs font-medium uppercase tracking-widest text-gray-400 border-b border-gray-50">
        {title}
      </p>
    )}
    {children}
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const name = user?.name || "Golu Jangra";
  const email = user?.email || "golu@gmail.com";
  const phone = user?.phone || "9876543210";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
    window.location.reload();
  };

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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* back button */}
        <button
          onClick={() => navigate(-1)}
          className="relative flex items-center gap-1.5 mb-6 text-sm"
          style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none" }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>

        {/* avatar + name */}
        <div className="relative flex flex-col items-center">
          <div className="relative mb-3">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium text-white"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "3px solid rgba(255,255,255,0.4)",
              }}
            >
              {initials}
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-white flex items-center justify-center"
              style={{ border: "2px solid rgba(255,255,255,0.5)" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#185FA5"
                strokeWidth="2"
                className="w-3 h-3"
              >
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>

          <p className="text-xl font-medium text-white">{name}</p>
          <p className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            {email}
          </p>

          <div
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "0.5px solid rgba(255,255,255,0.25)",
              color: "rgba(255,255,255,0.85)",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FAC775"
              strokeWidth="1.8"
              className="w-3 h-3"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            Member since Jan 2025
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-8 -mt-8">

        {/* Stats */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-2.5 mb-3"
        >
          {[
            { num: "12", label: "Bookings" },
            { num: "3", label: "Upcoming" },
            { num: "2.4k", label: "Points" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-2xl border border-gray-100 py-3.5 text-center"
            >
              <p className="text-xl font-medium text-gray-800">{s.num}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Account section */}
        <SectionCard title="Account">
          <ProfileRow
            index={1}
            bg="#E6F1FB" stroke="#185FA5"
            label="Edit profile"
            sub={`${name} · ${phone}`}
            onClick={() => navigate("/edit-profile")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-4 h-4">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />
          <ProfileRow
            index={2}
            bg="#EEEDFE" stroke="#534AB7"
            label="Change password"
            sub="Update your security credentials"
            onClick={() => navigate("/change-password")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-4 h-4">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            }
          />
          <ProfileRow
            index={3}
            bg="#E1F5EE" stroke="#0F6E56"
            label="Email & notifications"
            sub={email}
            onClick={() => navigate("/notifications")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
          />
        </SectionCard>

        {/* Activity section */}
        <SectionCard title="Activity">
          <ProfileRow
            index={4}
            bg="#FAEEDA" stroke="#854F0B"
            label="My bookings"
            sub="12 total · 3 upcoming"
            onClick={() => navigate("/bookings")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-4 h-4">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
          />
          <ProfileRow
            index={5}
            bg="#FAECE7" stroke="#993C1D"
            label="Rewards & points"
            sub="2,400 points available"
            onClick={() => navigate("/rewards")}
            icon={
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="w-4 h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          />
        </SectionCard>

        {/* Logout */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-red-50 transition-colors text-left"
          >
            <div
              className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
              style={{ background: "#FCEBEB" }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="#A32D2D"
                strokeWidth="1.8"
                className="w-4 h-4"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: "#A32D2D" }}>
                Sign out
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{email}</p>
            </div>
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default Profile;