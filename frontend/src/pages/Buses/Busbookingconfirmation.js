import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BusBookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData, selectedSeats, totalPrice, passengers, contact, bookingId, paymentMethod } = location.state || {};

  const handleDownload = () => {
    // In real app: generate PDF ticket
    alert("Ticket download started! (Implement PDF generation)");
  };

  return (
    <div style={styles.wrapper}>
      {/* Success Banner */}
      <div style={styles.successBanner}>
        <div style={styles.checkCircle}>✓</div>
        <h1 style={styles.successTitle}>Booking Confirmed!</h1>
        <p style={styles.successSub}>Your bus tickets have been booked successfully.</p>
        <div style={styles.bookingIdBadge}>Booking ID: <strong>{bookingId}</strong></div>
        <p style={styles.emailNote}>📧 E-ticket sent to <strong>{contact?.email}</strong></p>
      </div>

      {/* Ticket */}
      <div style={styles.ticket}>
        {/* Ticket Header */}
        <div style={styles.ticketHeader}>
          <span style={styles.ticketLogo}>🚌</span>
          <div>
            <div style={styles.ticketOperator}>{bus?.operator}</div>
            <div style={styles.ticketType}>{bus?.type?.replace(/_/g, " ").toUpperCase()}</div>
          </div>
          <div style={styles.pnrBox}>
            <div style={styles.pnrLabel}>PNR / Booking ID</div>
            <div style={styles.pnrNumber}>{bookingId}</div>
          </div>
        </div>

        {/* Ticket Body */}
        <div style={styles.ticketBody}>
          {/* Journey */}
          <div style={styles.journeySection}>
            <div style={styles.journeyPoint}>
              <div style={styles.journeyTime}>{bus?.departure}</div>
              <div style={styles.journeyCity}>{bus?.from}</div>
              <div style={styles.journeyDate}>{searchData?.date}</div>
            </div>
            <div style={styles.journeyMid}>
              <div style={styles.journeyDuration}>{bus?.duration}</div>
              <div style={styles.journeyArrow}>→</div>
            </div>
            <div style={styles.journeyPoint}>
              <div style={styles.journeyTime}>{bus?.arrival}</div>
              <div style={styles.journeyCity}>{bus?.to}</div>
            </div>
          </div>

          <div style={styles.ticketDivider}>
            <div style={styles.circleLeft} />
            <div style={styles.dashedLine} />
            <div style={styles.circleRight} />
          </div>

          {/* Passengers & Seats */}
          <div style={styles.detailsGrid}>
            <div>
              <div style={styles.detailLabel}>PASSENGERS</div>
              {passengers?.map((p, i) => (
                <div key={i} style={styles.passengerItem}>
                  {p.name} · Age {p.age} · Seat <strong>{selectedSeats?.[i]}</strong>
                </div>
              ))}
            </div>
            <div>
              <div style={styles.detailLabel}>CONTACT</div>
              <div style={styles.detailValue}>{contact?.phone}</div>
              <div style={styles.detailValue}>{contact?.email}</div>
            </div>
            <div>
              <div style={styles.detailLabel}>PAYMENT</div>
              <div style={styles.detailValue}>{paymentMethod?.toUpperCase()}</div>
              <div style={{ ...styles.detailValue, color: "#2e7d32", fontWeight: 700 }}>₹{totalPrice} PAID</div>
            </div>
          </div>
        </div>

        {/* Ticket Footer */}
        <div style={styles.ticketFooter}>
          <div style={styles.footerInfo}>⏰ Board 15 min before departure · 🪪 Carry original ID proof</div>
        </div>
      </div>

      {/* Status Steps */}
      <div style={styles.stepsCard}>
        <h3 style={styles.stepsTitle}>What's Next?</h3>
        <div style={styles.steps}>
          {[
            { icon: "📧", title: "Check Email", desc: "E-ticket sent to your email" },
            { icon: "📱", title: "Save Ticket", desc: "Download or screenshot your PNR" },
            { icon: "📍", title: "Track Bus", desc: "Live tracking starts 1 hour before departure" },
            { icon: "🚌", title: "Board Bus", desc: "Show e-ticket or PNR at boarding point" },
          ].map((s, i) => (
            <div key={i} style={styles.step}>
              <div style={styles.stepIcon}>{s.icon}</div>
              <div style={styles.stepTitle}>{s.title}</div>
              <div style={styles.stepDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button onClick={handleDownload} style={styles.downloadBtn}>⬇ Download Ticket</button>
        <button onClick={() => navigate("/buses")} style={styles.homeBtn}>Book Another Bus</button>
        <button onClick={() => navigate("/")} style={styles.homeBtn}>Go to Home</button>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: 800, margin: "0 auto", padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  successBanner: { textAlign: "center", padding: "36px 24px 32px", background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 20, marginBottom: 24, color: "#fff" },
  checkCircle: { width: 72, height: 72, borderRadius: "50%", background: "#2e7d32", color: "#fff", fontSize: 36, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontWeight: 700 },
  successTitle: { fontSize: 28, fontWeight: 800, margin: "0 0 8px" },
  successSub: { color: "#aaa", margin: "0 0 16px" },
  bookingIdBadge: { display: "inline-block", background: "rgba(255,255,255,0.1)", borderRadius: 30, padding: "8px 20px", fontSize: 15, marginBottom: 10 },
  emailNote: { fontSize: 13, color: "#aaa", margin: 0 },
  ticket: { background: "#fff", borderRadius: 20, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", marginBottom: 24, overflow: "hidden" },
  ticketHeader: { background: "linear-gradient(135deg, #e63946, #c1121f)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, color: "#fff" },
  ticketLogo: { fontSize: 36 },
  ticketOperator: { fontSize: 18, fontWeight: 800 },
  ticketType: { fontSize: 12, opacity: 0.8, marginTop: 2 },
  pnrBox: { marginLeft: "auto", textAlign: "right" },
  pnrLabel: { fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: 1 },
  pnrNumber: { fontSize: 18, fontWeight: 800, letterSpacing: 1 },
  ticketBody: { padding: 24 },
  journeySection: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  journeyPoint: { textAlign: "center" },
  journeyTime: { fontSize: 28, fontWeight: 800, color: "#1a1a2e" },
  journeyCity: { fontSize: 16, fontWeight: 700, color: "#444", marginTop: 4 },
  journeyDate: { fontSize: 13, color: "#888", marginTop: 2 },
  journeyMid: { flex: 1, textAlign: "center", padding: "0 16px" },
  journeyDuration: { fontSize: 13, color: "#888", marginBottom: 6 },
  journeyArrow: { fontSize: 28, color: "#e63946" },
  ticketDivider: { display: "flex", alignItems: "center", margin: "20px -24px", position: "relative" },
  circleLeft: { width: 24, height: 24, borderRadius: "50%", background: "#f5f5f5", border: "1.5px solid #e0e0e0", flexShrink: 0 },
  circleRight: { width: 24, height: 24, borderRadius: "50%", background: "#f5f5f5", border: "1.5px solid #e0e0e0", flexShrink: 0 },
  dashedLine: { flex: 1, borderTop: "2px dashed #e0e0e0" },
  detailsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginTop: 20 },
  detailLabel: { fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 },
  detailValue: { fontSize: 14, color: "#333", marginBottom: 4 },
  passengerItem: { fontSize: 14, color: "#333", marginBottom: 4 },
  ticketFooter: { background: "#f9f9f9", padding: "14px 24px", borderTop: "1px dashed #e0e0e0" },
  footerInfo: { fontSize: 13, color: "#888", textAlign: "center" },
  stepsCard: { background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", marginBottom: 24 },
  stepsTitle: { fontSize: 18, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 20 },
  steps: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  step: { textAlign: "center" },
  stepIcon: { fontSize: 32, marginBottom: 8 },
  stepTitle: { fontWeight: 700, color: "#1a1a2e", fontSize: 14, marginBottom: 4 },
  stepDesc: { fontSize: 12, color: "#888", lineHeight: 1.5 },
  actions: { display: "flex", gap: 12, flexWrap: "wrap" },
  downloadBtn: { flex: 1, padding: "14px 0", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: 15 },
  homeBtn: { flex: 1, padding: "14px 0", background: "#fff", border: "1.5px solid #ddd", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: 15, color: "#333" },
};

export default BusBookingConfirmation;