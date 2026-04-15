import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const GENDERS   = ["Male", "Female", "Other"];
const SEATS     = ["No preference", "Window", "Middle", "Aisle"];
const MEALS     = ["No preference", "Vegetarian", "Non-vegetarian", "Vegan", "Jain", "Diabetic"];
const ID_TYPES  = ["Aadhaar", "Passport", "PAN", "Voter ID"];

const emptyPassenger = () => ({
  name: "", age: "", gender: "Male",
  seat: "No preference", meal: "No preference",
  idType: "Aadhaar", idNumber: "",
});

const inputBase =
  "w-full pl-9 pr-3 py-2.5 text-sm border rounded-xl outline-none transition-all " +
  "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-gray-800";

const FieldLabel = ({ children }) => (
  <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1.5">{children}</p>
);

const IconWrap = ({ children }) => (
  <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">{children}</span>
);

const FlightPassengers = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { flight, search, fare } = state || {};

  const count = search?.passengers || 1;
  const [passengers, setPassengers] = useState(Array.from({ length: count }, emptyPassenger));
  const [errors, setErrors]         = useState(Array.from({ length: count }, () => ({})));
  const [contact, setContact]       = useState({ email: "", phone: "" });
  const [contactErr, setContactErr] = useState({});

  const update = (idx, field, value) => {
    setPassengers(passengers.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    setErrors(errors.map((e, i) => i === idx ? { ...e, [field]: "" } : e));
  };

  const validate = () => {
    let valid = true;
    const errs = passengers.map((p) => {
      const e = {};
      if (!p.name.trim())    { e.name     = "Required"; valid = false; }
      if (!p.age || p.age < 1 || p.age > 120) { e.age = "Valid age required"; valid = false; }
      if (!p.idNumber.trim()) { e.idNumber = "Required"; valid = false; }
      return e;
    });
    setErrors(errs);

    const ce = {};
    if (!contact.email.match(/\S+@\S+\.\S+/)) { ce.email = "Valid email required"; valid = false; }
    if (!contact.phone.match(/^[6-9]\d{9}$/))  { ce.phone = "Valid 10-digit mobile"; valid = false; }
    setContactErr(ce);
    return valid;
  };

  const handleContinue = () => {
    if (!validate()) return;
    navigate("/flights/summary", { state: { flight, search, fare, passengers, contact } });
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
          Cabin selection
        </button>
        <p className="relative text-white text-lg font-medium">Passenger details</p>
        <p className="relative text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
          {search?.from} → {search?.to} · {search?.cabin} · ₹{fare?.toLocaleString("en-IN")} / person
        </p>
      </div>

      <div className="px-4 pb-8 -mt-5">
        {passengers.map((p, idx) => (
          <motion.div key={idx}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">

            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                style={{ background: "#185FA5" }}>{idx + 1}</div>
              <p className="text-sm font-medium text-gray-800">Passenger {idx + 1}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Name */}
              <div className="col-span-2">
                <FieldLabel>Full name (as on ID)</FieldLabel>
                <div className="relative">
                  <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg></IconWrap>
                  <input type="text" placeholder="Full name" value={p.name}
                    onChange={(e) => update(idx, "name", e.target.value)}
                    className={`${inputBase} ${errors[idx]?.name ? "border-red-300" : ""}`} />
                </div>
                {errors[idx]?.name && <p className="text-xs text-red-500 mt-1">{errors[idx].name}</p>}
              </div>

              {/* Age */}
              <div>
                <FieldLabel>Age</FieldLabel>
                <div className="relative">
                  <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                  </svg></IconWrap>
                  <input type="number" placeholder="Age" min="1" max="120" value={p.age}
                    onChange={(e) => update(idx, "age", e.target.value)}
                    className={`${inputBase} ${errors[idx]?.age ? "border-red-300" : ""}`} />
                </div>
                {errors[idx]?.age && <p className="text-xs text-red-500 mt-1">{errors[idx].age}</p>}
              </div>

              {/* Gender */}
              <div>
                <FieldLabel>Gender</FieldLabel>
                <div className="relative">
                  <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                    <circle cx="12" cy="8" r="4"/><path d="M12 12v8M8 16h8"/>
                  </svg></IconWrap>
                  <select value={p.gender} onChange={(e) => update(idx, "gender", e.target.value)} className={inputBase}>
                    {GENDERS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Seat preference */}
              <div className="col-span-2">
                <FieldLabel>Seat preference</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {SEATS.map((s) => (
                    <button key={s} onClick={() => update(idx, "seat", s)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={{
                        background:  p.seat === s ? "#E6F1FB" : "white",
                        borderColor: p.seat === s ? "#185FA5" : "#e5e7eb",
                        color:       p.seat === s ? "#0C447C"  : "#6b7280",
                      }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal preference */}
              <div className="col-span-2">
                <FieldLabel>Meal preference</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {MEALS.map((m) => (
                    <button key={m} onClick={() => update(idx, "meal", m)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-all"
                      style={{
                        background:  p.meal === m ? "#E1F5EE" : "white",
                        borderColor: p.meal === m ? "#0F6E56" : "#e5e7eb",
                        color:       p.meal === m ? "#0F6E56"  : "#6b7280",
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID type */}
              <div>
                <FieldLabel>ID type</FieldLabel>
                <div className="relative">
                  <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                  </svg></IconWrap>
                  <select value={p.idType} onChange={(e) => update(idx, "idType", e.target.value)} className={inputBase}>
                    {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* ID number */}
              <div>
                <FieldLabel>ID number</FieldLabel>
                <div className="relative">
                  <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                  </svg></IconWrap>
                  <input type="text" placeholder="ID number" value={p.idNumber}
                    onChange={(e) => update(idx, "idNumber", e.target.value)}
                    className={`${inputBase} ${errors[idx]?.idNumber ? "border-red-300" : ""}`} />
                </div>
                {errors[idx]?.idNumber && <p className="text-xs text-red-500 mt-1">{errors[idx].idNumber}</p>}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Contact */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Contact details</p>
          <div className="mb-3">
            <FieldLabel>Email for boarding pass</FieldLabel>
            <div className="relative">
              <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg></IconWrap>
              <input type="email" placeholder="you@example.com" value={contact.email}
                onChange={(e) => { setContact({ ...contact, email: e.target.value }); setContactErr({ ...contactErr, email: "" }); }}
                className={`${inputBase} ${contactErr.email ? "border-red-300" : ""}`} />
            </div>
            {contactErr.email && <p className="text-xs text-red-500 mt-1">{contactErr.email}</p>}
          </div>
          <div>
            <FieldLabel>Mobile number</FieldLabel>
            <div className="relative">
              <IconWrap><svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-4 h-4">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg></IconWrap>
              <input type="tel" placeholder="10-digit mobile" value={contact.phone}
                onChange={(e) => { setContact({ ...contact, phone: e.target.value }); setContactErr({ ...contactErr, phone: "" }); }}
                className={`${inputBase} ${contactErr.phone ? "border-red-300" : ""}`} />
            </div>
            {contactErr.phone && <p className="text-xs text-red-500 mt-1">{contactErr.phone}</p>}
          </div>
        </div>

        <button onClick={handleContinue}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2"
          style={{ background: "#185FA5" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
          Continue to summary
        </button>
      </div>
    </motion.div>
  );
};

export default FlightPassengers;