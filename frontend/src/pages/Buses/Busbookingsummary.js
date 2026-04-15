import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BusBookingSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats, totalPrice, passengers, contact } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [loading, setLoading] = useState(false);

  const gst = Math.round(totalPrice * 0.05);
  const serviceFee = 30;
  const grandTotal = totalPrice + gst + serviceFee;

  const paymentMethods = [
    { id: "upi", label: "UPI / QR", icon: "📱" },
    { id: "card", label: "Credit / Debit Card", icon: "💳" },
    { id: "netbanking", label: "Net Banking", icon: "🏦" },
    { id: "wallet", label: "Wallets", icon: "👛" },
  ];

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      const bookingId = "BUS" + Math.random().toString(36).substring(2, 10).toUpperCase();
      navigate("/buses/confirmation", {
        state: { bus, searchData, selectedSeats, totalPrice: grandTotal, passengers, contact, bookingId, paymentMethod },
      });
    }, 1800);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <div>
          <h2 style={styles.title}>Review & Payment</h2>
          <p style={styles.subtitle}>Please review your booking before paying</p>
        </div>
      </div>

      <div style={styles.layout}>
        <div style={styles.mainCol}>
          {/* Bus Details */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>🚌 Journey Details</h3>
            <div style={styles.journeyBar}>
              <div style={styles.journeyPoint}>
                <div style={styles.journeyTime}>{bus?.departure}</div>
                <div style={styles.journeyCity}>{bus?.from}</div>
              </div>
              <div style={styles.journeyLine}>
                <div style={styles.journeyDuration}>{bus?.duration}</div>
                <div style={styles.dashedLine} />
              </div>
              <div style={styles.journeyPoint}>
                <div style={styles.journeyTime}>{bus?.arrival}</div>
                <div style={styles.journeyCity}>{bus?.to}</div>
              </div>
            </div>
            <div style={styles.infoGrid}>
              <div style={styles.infoItem}><span style={styles.infoLabel}>Operator</span><strong>{bus?.operator}</strong></div>
              <div style={styles.infoItem}><span style={styles.infoLabel}>Date</span><strong>{searchData?.date}</strong></div>
              <div style={styles.infoItem}><span style={styles.infoLabel}>Seats</span><strong>{selectedSeats?.join(", ")}</strong></div>
              <div style={styles.infoItem}><span style={styles.infoLabel}>Bus Type</span><strong>{bus?.type?.replace(/_/g, " ").toUpperCase()}</strong></div>
            </div>
          </div>

          {/* Passengers */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>👥 Passengers</h3>
            {passengers?.map((p, i) => (
              <div key={i} style={styles.passengerRow}>
                <div style={styles.passengerAvatar}>{p.name?.[0]?.toUpperCase() || "?"}</div>
                <div>
                  <div style={styles.passengerName}>{p.name}</div>
                  <div style={styles.passengerInfo}>
                    Age: {p.age} · {p.gender} · Seat: {selectedSeats?.[i]}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
              📧 {contact?.email} &nbsp;|&nbsp; 📞 {contact?.phone}
            </div>
          </div>

          {/* Payment */}
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>💳 Payment Method</h3>
            <div style={styles.paymentGrid}>
              {paymentMethods.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  style={{ ...styles.paymentOption, ...(paymentMethod === m.id ? styles.paymentSelected : {}) }}
                >
                  <span style={styles.paymentIcon}>{m.icon}</span>
                  <span style={styles.paymentLabel}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fare Summary Sidebar */}
        <div style={styles.sidebarCol}>
          <div style={styles.summaryCard}>
            <h3 style={styles.summaryTitle}>Fare Breakdown</h3>
            <div style={styles.fareRow}><span>Base Fare</span><strong>₹{totalPrice}</strong></div>
            <div style={styles.fareRow}><span>GST (5%)</span><strong>₹{gst}</strong></div>
            <div style={styles.fareRow}><span>Service Fee</span><strong>₹{serviceFee}</strong></div>
            <hr style={styles.hr} />
            <div style={styles.fareRow}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Total</span>
              <strong style={{ color: "#e63946", fontSize: 22 }}>₹{grandTotal}</strong>
            </div>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ ...styles.payBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "Processing Payment..." : `Pay ₹${grandTotal}`}
            </button>
            <p style={styles.secureNote}>🔒 100% Secure Payment · PCI DSS Compliant</p>
          </div>

          <div style={styles.cancelCard}>
            <h4 style={styles.cancelTitle}>Cancellation Policy</h4>
            <div style={styles.cancelRow}><span>Before 24 hours</span><strong style={{ color: "#2e7d32" }}>Full Refund</strong></div>
            <div style={styles.cancelRow}><span>2 – 24 hours</span><strong style={{ color: "#e65100" }}>50% Refund</strong></div>
            <div style={styles.cancelRow}><span>Within 2 hours</span><strong style={{ color: "#e63946" }}>No Refund</strong></div>
          </div>
        </div>
      </div>
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
  cardTitle: { fontSize: 17, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 16 },
  journeyBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  journeyPoint: { textAlign: "center" },
  journeyTime: { fontSize: 24, fontWeight: 800, color: "#1a1a2e" },
  journeyCity: { fontSize: 13, color: "#888", marginTop: 2 },
  journeyLine: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  journeyDuration: { fontSize: 12, color: "#888" },
  dashedLine: { width: "100%", borderTop: "2px dashed #ddd" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  infoItem: { display: "flex", flexDirection: "column", gap: 2 },
  infoLabel: { fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 0.5 },
  passengerRow: { display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
  passengerAvatar: { width: 40, height: 40, borderRadius: "50%", background: "#e63946", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, flexShrink: 0 },
  passengerName: { fontWeight: 700, color: "#1a1a2e", fontSize: 15 },
  passengerInfo: { fontSize: 13, color: "#888", marginTop: 2 },
  paymentGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  paymentOption: { border: "1.5px solid #e0e0e0", borderRadius: 12, padding: "14px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, transition: "all 0.2s" },
  paymentSelected: { borderColor: "#e63946", background: "#fff5f5" },
  paymentIcon: { fontSize: 22 },
  paymentLabel: { fontSize: 13, fontWeight: 600, color: "#333" },
  sidebarCol: { width: 280, display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 },
  summaryCard: { background: "#fff", borderRadius: 14, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  summaryTitle: { fontSize: 17, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 16 },
  fareRow: { display: "flex", justifyContent: "space-between", fontSize: 14, color: "#555", marginBottom: 10 },
  hr: { border: "none", borderTop: "1px solid #f0f0f0", margin: "12px 0" },
  payBtn: { width: "100%", padding: "15px 0", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 16, marginTop: 12 },
  secureNote: { textAlign: "center", fontSize: 12, color: "#999", marginTop: 10 },
  cancelCard: { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  cancelTitle: { fontSize: 14, fontWeight: 700, color: "#1a1a2e", margin: "0 0 12px" },
  cancelRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 8 },
};

export default BusBookingSummary;