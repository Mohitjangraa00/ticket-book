import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BusPassengerDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats, totalPrice } = location.state || {};

  const passengerCount = searchData?.passengers || 1;
  const [passengers, setPassengers] = useState(
    Array.from({ length: passengerCount }, () => ({
      name: "", age: "", gender: "male", idType: "aadhar", idNumber: "",
    }))
  );
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [errors, setErrors] = useState({});

  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const validate = () => {
    const newErrors = {};
    passengers.forEach((p, i) => {
      if (!p.name.trim()) newErrors[`name_${i}`] = "Name required";
      if (!p.age || p.age < 1 || p.age > 120) newErrors[`age_${i}`] = "Valid age required";
      if (!p.idNumber.trim()) newErrors[`id_${i}`] = "ID number required";
    });
    if (!contact.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) newErrors.email = "Valid email required";
    if (!contact.phone || contact.phone.length !== 10) newErrors.phone = "10-digit phone required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    navigate("/buses/booking-summary", {
      state: { bus, searchData, selectedSeats, totalPrice, passengers, contact },
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <div>
          <h2 style={styles.title}>Passenger Details</h2>
          <p style={styles.subtitle}>{bus?.operator} · {bus?.from} → {bus?.to} · Seats: {selectedSeats?.join(", ")}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.layout}>
        <div style={styles.mainCol}>
          {/* Passengers */}
          {passengers.map((p, i) => (
            <div key={i} style={styles.card}>
              <h3 style={styles.cardTitle}>Passenger {i + 1} · Seat {selectedSeats?.[i]}</h3>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Full Name *</label>
                  <input
                    placeholder="As on ID proof"
                    value={p.name}
                    onChange={(e) => updatePassenger(i, "name", e.target.value)}
                    style={{ ...styles.input, ...(errors[`name_${i}`] ? styles.inputError : {}) }}
                  />
                  {errors[`name_${i}`] && <span style={styles.errorText}>{errors[`name_${i}`]}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Age *</label>
                  <input
                    type="number" placeholder="Age" min="1" max="120"
                    value={p.age}
                    onChange={(e) => updatePassenger(i, "age", e.target.value)}
                    style={{ ...styles.input, ...(errors[`age_${i}`] ? styles.inputError : {}) }}
                  />
                  {errors[`age_${i}`] && <span style={styles.errorText}>{errors[`age_${i}`]}</span>}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Gender</label>
                  <select value={p.gender} onChange={(e) => updatePassenger(i, "gender", e.target.value)} style={styles.input}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>ID Type</label>
                  <select value={p.idType} onChange={(e) => updatePassenger(i, "idType", e.target.value)} style={styles.input}>
                    <option value="aadhar">Aadhar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="passport">Passport</option>
                    <option value="driving">Driving License</option>
                  </select>
                </div>
                <div style={{ ...styles.field, flex: 2 }}>
                  <label style={styles.label}>ID Number *</label>
                  <input
                    placeholder="Enter ID number"
                    value={p.idNumber}
                    onChange={(e) => updatePassenger(i, "idNumber", e.target.value)}
                    style={{ ...styles.input, ...(errors[`id_${i}`] ? styles.inputError : {}) }}
                  />
                  {errors[`id_${i}`] && <span style={styles.errorText}>{errors[`id_${i}`]}</span>}
                </div>
              </div>
            </div>
          ))}

          {/* Contact */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Contact Details</h3>
            <p style={styles.cardSubtitle}>Booking confirmation will be sent here</p>
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Email *</label>
                <input
                  type="email" placeholder="your@email.com"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Phone *</label>
                <input
                  type="tel" placeholder="10-digit mobile number"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebarCol}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Fare Summary</h3>
            <div style={styles.summaryRow}><span>Base Fare ({selectedSeats?.length} seat{selectedSeats?.length > 1 ? "s" : ""})</span><strong>₹{totalPrice}</strong></div>
            <div style={styles.summaryRow}><span>GST (5%)</span><strong>₹{Math.round(totalPrice * 0.05)}</strong></div>
            <div style={styles.summaryRow}><span>Service Fee</span><strong>₹30</strong></div>
            <hr style={styles.hr} />
            <div style={styles.summaryRow}>
              <span style={{ fontWeight: 700 }}>Total Amount</span>
              <strong style={{ color: "#e63946", fontSize: 20 }}>₹{totalPrice + Math.round(totalPrice * 0.05) + 30}</strong>
            </div>
            <button type="submit" style={styles.submitBtn}>Proceed to Review →</button>
          </div>

          <div style={styles.infoCard}>
            <h4 style={styles.infoTitle}>📋 Important Info</h4>
            <ul style={styles.infoList}>
              <li>Carry original ID proof while boarding</li>
              <li>Board 15 minutes before departure</li>
              <li>Free cancellation up to 2 hours before travel</li>
            </ul>
          </div>
        </div>
      </form>
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  backBtn: { background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  title: { fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { color: "#888", fontSize: 14, margin: "4px 0 0" },
  layout: { display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" },
  mainCol: { flex: 1, display: "flex", flexDirection: "column", gap: 16, minWidth: 300 },
  card: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  cardTitle: { fontSize: 17, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: "#888", marginBottom: 16, marginTop: 4 },
  row: { display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 },
  field: { flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 14, outline: "none", background: "#fafafa" },
  inputError: { borderColor: "#e63946" },
  errorText: { fontSize: 12, color: "#e63946" },
  sidebarCol: { width: 280, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 },
  summaryCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  summaryTitle: { fontSize: 17, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 16 },
  summaryRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555", marginBottom: 10 },
  hr: { border: "none", borderTop: "1px solid #f0f0f0", margin: "12px 0" },
  submitBtn: { width: "100%", padding: "14px 0", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15, marginTop: 12 },
  infoCard: { background: "#fff8f0", borderRadius: 14, padding: 20, border: "1px solid #ffe0b2" },
  infoTitle: { fontSize: 14, fontWeight: 700, color: "#e65100", margin: "0 0 10px" },
  infoList: { paddingLeft: 18, margin: 0, display: "flex", flexDirection: "column", gap: 6 },
};

export default BusPassengerDetails;