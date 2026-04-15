import React, { useState } from "react";

const TYPE_COLORS = {
  ac_sleeper: { bg: "#e8f4fd", color: "#1565c0" },
  non_ac_sleeper: { bg: "#f3e5f5", color: "#6a1b9a" },
  ac_seater: { bg: "#e8f5e9", color: "#2e7d32" },
  non_ac_seater: { bg: "#fff3e0", color: "#e65100" },
  volvo: { bg: "#fce4ec", color: "#c62828" },
};

const TYPE_LABELS = {
  ac_sleeper: "AC Sleeper",
  non_ac_sleeper: "Non-AC Sleeper",
  ac_seater: "AC Seater",
  non_ac_seater: "Non-AC Seater",
  volvo: "Volvo / Multi-Axle",
};

const AMENITY_ICONS = { WiFi: "📶", "Charging Point": "🔌", Blanket: "🛏️" };

const BusCard = ({ bus, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const typeStyle = TYPE_COLORS[bus.type] || { bg: "#f5f5f5", color: "#333" };

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        {/* Operator Info */}
        <div style={styles.operatorSection}>
          <div style={styles.busIcon}>🚌</div>
          <div>
            <div style={styles.operatorName}>{bus.operator}</div>
            <span style={{ ...styles.typeBadge, background: typeStyle.bg, color: typeStyle.color }}>
              {TYPE_LABELS[bus.type] || bus.type}
            </span>
          </div>
        </div>

        {/* Timing */}
        <div style={styles.timingSection}>
          <div style={styles.time}>{bus.departure}</div>
          <div style={styles.durationBox}>
            <div style={styles.durationLine} />
            <span style={styles.durationText}>{bus.duration}</span>
          </div>
          <div style={styles.time}>{bus.arrival}</div>
        </div>

        {/* Seats & Price */}
        <div style={styles.priceSection}>
          <div style={styles.price}>₹{bus.price}</div>
          <div style={styles.perPerson}>per person</div>
          <div style={{ ...styles.seatsBadge, color: bus.availableSeats < 10 ? "#e63946" : "#2e7d32" }}>
            {bus.availableSeats} seats left
          </div>
          <button onClick={onSelect} style={styles.selectBtn}>Select Seats</button>
        </div>
      </div>

      {/* Amenities & Expand */}
      <div style={styles.bottom}>
        <div style={styles.amenities}>
          {bus.liveTracking && <span style={styles.amenity}>📍 Live Tracking</span>}
          {bus.amenities.map((a) => (
            <span key={a} style={styles.amenity}>{AMENITY_ICONS[a] || "✓"} {a}</span>
          ))}
          <span style={styles.ratingBadge}>⭐ {bus.rating}</span>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={styles.expandBtn}>
          {expanded ? "Hide Details ▲" : "View Details ▼"}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div style={styles.details}>
          <div style={styles.detailRow}>
            <div style={styles.detailItem}><strong>Total Seats:</strong> {bus.totalSeats}</div>
            <div style={styles.detailItem}><strong>Available:</strong> {bus.availableSeats}</div>
            <div style={styles.detailItem}><strong>Type:</strong> {TYPE_LABELS[bus.type]}</div>
            <div style={styles.detailItem}><strong>Rating:</strong> ⭐ {bus.rating}/5</div>
          </div>
          <div style={styles.policies}>
            <div style={styles.policy}>
              <strong>🔄 Cancellation Policy:</strong> Free cancellation up to 2 hours before departure.
            </div>
            <div style={styles.policy}>
              <strong>🧳 Luggage:</strong> 1 bag per passenger (up to 15 kg) is free.
            </div>
            <div style={styles.policy}>
              <strong>🕐 Boarding Time:</strong> Board 15 minutes before departure.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: "#fff", borderRadius: 14, padding: 20, marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1.5px solid #f0f0f0" },
  top: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 },
  operatorSection: { display: "flex", alignItems: "center", gap: 12, minWidth: 180 },
  busIcon: { fontSize: 32, background: "#fff8f0", borderRadius: 10, padding: "6px 10px" },
  operatorName: { fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginBottom: 4 },
  typeBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 },
  timingSection: { display: "flex", alignItems: "center", gap: 12 },
  time: { fontSize: 22, fontWeight: 800, color: "#1a1a2e" },
  durationBox: { display: "flex", flexDirection: "column", alignItems: "center", minWidth: 80 },
  durationLine: { width: 70, height: 2, background: "#ddd", borderRadius: 2, marginBottom: 4 },
  durationText: { fontSize: 12, color: "#888", fontWeight: 500 },
  priceSection: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 },
  price: { fontSize: 26, fontWeight: 800, color: "#e63946" },
  perPerson: { fontSize: 12, color: "#999" },
  seatsBadge: { fontSize: 13, fontWeight: 600 },
  selectBtn: { marginTop: 6, padding: "10px 22px", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14 },
  bottom: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0", flexWrap: "wrap", gap: 8 },
  amenities: { display: "flex", gap: 12, flexWrap: "wrap" },
  amenity: { fontSize: 12, color: "#555", background: "#f8f8f8", padding: "4px 10px", borderRadius: 20 },
  ratingBadge: { fontSize: 12, color: "#fff", background: "#2e7d32", padding: "4px 10px", borderRadius: 20, fontWeight: 700 },
  expandBtn: { background: "none", border: "none", color: "#e63946", fontWeight: 600, cursor: "pointer", fontSize: 13 },
  details: { marginTop: 16, padding: 16, background: "#fafafa", borderRadius: 10 },
  detailRow: { display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 12 },
  detailItem: { fontSize: 14, color: "#444" },
  policies: { display: "flex", flexDirection: "column", gap: 8 },
  policy: { fontSize: 13, color: "#555", lineHeight: 1.5 },
};

export default BusCard;