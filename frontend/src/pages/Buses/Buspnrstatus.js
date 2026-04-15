import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_PNR = {
  BUS123456: {
    bookingId: "BUS123456",
    status: "Confirmed",
    operator: "RedBus Express",
    from: "Delhi",
    to: "Jaipur",
    date: "2024-04-15",
    departure: "07:00",
    arrival: "12:30",
    duration: "5h 30m",
    seats: ["3A", "3B"],
    passengers: [
      { name: "Rahul Sharma", age: 28, gender: "male", seat: "3A" },
      { name: "Priya Sharma", age: 25, gender: "female", seat: "3B" },
    ],
    totalPaid: 840,
    boardingPoint: "Kashmiri Gate ISBT, Delhi",
    droppingPoint: "Sindhi Camp Bus Stand, Jaipur",
  },
};

const STATUS_COLORS = {
  Confirmed: { bg: "#e8f5e9", color: "#2e7d32", icon: "✓" },
  Cancelled: { bg: "#ffebee", color: "#c62828", icon: "✕" },
  Pending: { bg: "#fff3e0", color: "#e65100", icon: "⏳" },
};

const BusPNRStatus = () => {
  const navigate = useNavigate();
  const [pnrInput, setPnrInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  const handleSearch = () => {
    if (!pnrInput.trim()) {
      setError("Please enter a PNR / Booking ID");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    setTimeout(() => {
      const found = MOCK_PNR[pnrInput.trim().toUpperCase()];
      if (found) {
        setResult(found);
      } else {
        setError("No booking found with this PNR. Try: BUS123456");
      }
      setLoading(false);
    }, 1000);
  };

  const handleCancel = () => {
    setShowCancel(false);
    setCancelled(true);
    setResult({ ...result, status: "Cancelled" });
  };

  const statusStyle = result ? STATUS_COLORS[cancelled ? "Cancelled" : result.status] || STATUS_COLORS.Confirmed : {};

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={() => navigate("/buses")} style={styles.backBtn}>← Back</button>
        <div>
          <h2 style={styles.title}>PNR Status</h2>
          <p style={styles.subtitle}>Track your bus booking</p>
        </div>
      </div>

      {/* Search Box */}
      <div style={styles.searchCard}>
        <label style={styles.label}>Enter PNR / Booking ID</label>
        <div style={styles.searchRow}>
          <input
            value={pnrInput}
            onChange={(e) => setPnrInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="e.g. BUS123456"
            style={styles.input}
          />
          <button onClick={handleSearch} style={styles.searchBtn} disabled={loading}>
            {loading ? "Searching..." : "Track Booking"}
          </button>
        </div>
        {error && <p style={styles.errorText}>⚠ {error}</p>}
      </div>

      {/* Result */}
      {result && (
        <div style={styles.resultCard}>
          {/* Status */}
          <div style={{ ...styles.statusBanner, background: statusStyle.bg }}>
            <span style={{ ...styles.statusIcon, color: statusStyle.color }}>{statusStyle.icon}</span>
            <div>
              <div style={{ ...styles.statusText, color: statusStyle.color }}>
                Booking {result.status === "Confirmed" && !cancelled ? "Confirmed" : cancelled ? "Cancelled" : result.status}
              </div>
              <div style={styles.bookingId}>Booking ID: {result.bookingId}</div>
            </div>
          </div>

          {/* Journey Details */}
          <div style={styles.journeyBar}>
            <div style={styles.journeyPoint}>
              <div style={styles.time}>{result.departure}</div>
              <div style={styles.city}>{result.from}</div>
            </div>
            <div style={styles.journeyMid}>
              <div style={styles.duration}>{result.duration}</div>
              <div style={styles.dottedLine} />
              <div style={styles.busEmoji}>🚌</div>
            </div>
            <div style={styles.journeyPoint}>
              <div style={styles.time}>{result.arrival}</div>
              <div style={styles.city}>{result.to}</div>
            </div>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoBlock}>
              <div style={styles.infoLabel}>OPERATOR</div>
              <div style={styles.infoValue}>{result.operator}</div>
            </div>
            <div style={styles.infoBlock}>
              <div style={styles.infoLabel}>DATE</div>
              <div style={styles.infoValue}>{result.date}</div>
            </div>
            <div style={styles.infoBlock}>
              <div style={styles.infoLabel}>SEATS</div>
              <div style={styles.infoValue}>{result.seats.join(", ")}</div>
            </div>
            <div style={styles.infoBlock}>
              <div style={styles.infoLabel}>AMOUNT PAID</div>
              <div style={styles.infoValue}>₹{result.totalPaid}</div>
            </div>
          </div>

          <hr style={styles.hr} />

          {/* Boarding/Dropping */}
          <div style={styles.pointsGrid}>
            <div style={styles.pointCard}>
              <div style={styles.pointLabel}>📍 Boarding Point</div>
              <div style={styles.pointValue}>{result.boardingPoint}</div>
            </div>
            <div style={styles.pointCard}>
              <div style={styles.pointLabel}>🏁 Dropping Point</div>
              <div style={styles.pointValue}>{result.droppingPoint}</div>
            </div>
          </div>

          <hr style={styles.hr} />

          {/* Passengers */}
          <h4 style={styles.sectionTitle}>Passengers</h4>
          {result.passengers.map((p, i) => (
            <div key={i} style={styles.passengerRow}>
              <div style={styles.passengerAvatar}>{p.name[0]}</div>
              <div>
                <div style={styles.passengerName}>{p.name}</div>
                <div style={styles.passengerSub}>Age {p.age} · {p.gender} · Seat {p.seat}</div>
              </div>
            </div>
          ))}

          {/* Actions */}
          {!cancelled && result.status !== "Cancelled" && (
            <div style={styles.actionRow}>
              <button style={styles.downloadBtn} onClick={() => alert("Ticket download — implement PDF")}>
                ⬇ Download Ticket
              </button>
              <button style={styles.cancelBtn} onClick={() => setShowCancel(true)}>
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cancel Dialog */}
      {showCancel && (
        <div style={styles.overlay}>
          <div style={styles.dialog}>
            <h3 style={styles.dialogTitle}>Cancel Booking?</h3>
            <p style={styles.dialogText}>
              Refund will be processed as per the cancellation policy. This action cannot be undone.
            </p>
            <div style={styles.dialogActions}>
              <button onClick={() => setShowCancel(false)} style={styles.dialogNo}>Keep Booking</button>
              <button onClick={handleCancel} style={styles.dialogYes}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: 700, margin: "0 auto", padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  backBtn: { background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  title: { fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { color: "#888", fontSize: 14, margin: "4px 0 0" },
  searchCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: 700, color: "#555", display: "block", marginBottom: 10 },
  searchRow: { display: "flex", gap: 12 },
  input: { flex: 1, padding: "13px 16px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 15, outline: "none" },
  searchBtn: { padding: "13px 24px", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" },
  errorText: { color: "#e63946", fontSize: 13, margin: "10px 0 0" },
  resultCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  statusBanner: { display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", borderRadius: 10, marginBottom: 20 },
  statusIcon: { fontSize: 24, fontWeight: 700 },
  statusText: { fontSize: 17, fontWeight: 700 },
  bookingId: { fontSize: 13, color: "#888", marginTop: 2 },
  journeyBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  journeyPoint: { textAlign: "center" },
  time: { fontSize: 24, fontWeight: 800, color: "#1a1a2e" },
  city: { fontSize: 14, color: "#888", marginTop: 4 },
  journeyMid: { flex: 1, textAlign: "center" },
  duration: { fontSize: 12, color: "#888", marginBottom: 4 },
  dottedLine: { borderTop: "2px dashed #ddd", margin: "4px 0" },
  busEmoji: { fontSize: 18 },
  infoGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 },
  infoBlock: {},
  infoLabel: { fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  hr: { border: "none", borderTop: "1px solid #f0f0f0", margin: "16px 0" },
  pointsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 },
  pointCard: { background: "#f9f9f9", borderRadius: 10, padding: 14 },
  pointLabel: { fontSize: 12, color: "#888", marginBottom: 6, fontWeight: 600 },
  pointValue: { fontSize: 14, color: "#333", fontWeight: 500 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 12 },
  passengerRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  passengerAvatar: { width: 36, height: 36, borderRadius: "50%", background: "#e63946", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 },
  passengerName: { fontWeight: 700, color: "#1a1a2e", fontSize: 14 },
  passengerSub: { fontSize: 12, color: "#888", marginTop: 2 },
  actionRow: { display: "flex", gap: 12, marginTop: 20 },
  downloadBtn: { flex: 1, padding: "13px 0", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  cancelBtn: { flex: 1, padding: "13px 0", background: "#fff", border: "1.5px solid #e63946", color: "#e63946", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  dialog: { background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, width: "90%", textAlign: "center" },
  dialogTitle: { fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginTop: 0 },
  dialogText: { fontSize: 14, color: "#666", lineHeight: 1.6, marginBottom: 24 },
  dialogActions: { display: "flex", gap: 12 },
  dialogNo: { flex: 1, padding: "12px 0", background: "#f5f5f5", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  dialogYes: { flex: 1, padding: "12px 0", background: "#e63946", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 },
};

export default BusPNRStatus;