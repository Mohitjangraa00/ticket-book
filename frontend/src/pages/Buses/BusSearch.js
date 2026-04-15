import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BusSearch = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
    busType: "all",
  });

  const popularCities = [
    "Delhi", "Mumbai", "Bangalore", "Hyderabad", "Chennai",
    "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Chandigarh",
  ];

  const busTypes = [
    { value: "all", label: "All Buses" },
    { value: "ac_sleeper", label: "AC Sleeper" },
    { value: "non_ac_sleeper", label: "Non-AC Sleeper" },
    { value: "ac_seater", label: "AC Seater" },
    { value: "non_ac_seater", label: "Non-AC Seater" },
    { value: "volvo", label: "Volvo / Multi-Axle" },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSwap = () => {
    setForm({ ...form, from: form.to, to: form.from });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date) {
      alert("Please fill all required fields.");
      return;
    }
    navigate("/buses/results", { state: form });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <h1 style={styles.title}>🚌 Book Bus Tickets</h1>
        <p style={styles.subtitle}>Safe, affordable & comfortable bus journeys</p>
      </div>

      <form onSubmit={handleSearch} style={styles.card}>
        {/* From / To */}
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>From</label>
            <select name="from" value={form.from} onChange={handleChange} style={styles.input} required>
              <option value="">Select city</option>
              {popularCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button type="button" onClick={handleSwap} style={styles.swapBtn} title="Swap cities">
            ⇄
          </button>

          <div style={styles.field}>
            <label style={styles.label}>To</label>
            <select name="to" value={form.to} onChange={handleChange} style={styles.input} required>
              <option value="">Select city</option>
              {popularCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Date / Passengers / Bus Type */}
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Journey Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Passengers</label>
            <select name="passengers" value={form.passengers} onChange={handleChange} style={styles.input}>
              {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} Passenger{n > 1 ? "s" : ""}</option>)}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Bus Type</label>
            <select name="busType" value={form.busType} onChange={handleChange} style={styles.input}>
              {busTypes.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" style={styles.searchBtn}>Search Buses 🔍</button>
      </form>

      {/* Popular Routes */}
      <div style={styles.popularSection}>
        <h3 style={styles.popularTitle}>Popular Routes</h3>
        <div style={styles.routeGrid}>
          {[
            { from: "Delhi", to: "Jaipur", price: "₹350" },
            { from: "Mumbai", to: "Pune", price: "₹200" },
            { from: "Bangalore", to: "Hyderabad", price: "₹650" },
            { from: "Delhi", to: "Chandigarh", price: "₹300" },
            { from: "Chennai", to: "Bangalore", price: "₹500" },
            { from: "Kolkata", to: "Bhubaneswar", price: "₹400" },
          ].map((r, i) => (
            <div
              key={i}
              style={styles.routeCard}
              onClick={() => {
                setForm({ ...form, from: r.from, to: r.to });
                window.scrollTo(0, 0);
              }}
            >
              <span style={styles.routeFrom}>{r.from}</span>
              <span style={styles.routeArrow}>→</span>
              <span style={styles.routeTo}>{r.to}</span>
              <span style={styles.routePrice}>from {r.price}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: { maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { textAlign: "center", marginBottom: 32 },
  title: { fontSize: 32, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { color: "#666", marginTop: 8 },
  card: { background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.10)", marginBottom: 32 },
  row: { display: "flex", gap: 16, alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap" },
  field: { flex: 1, minWidth: 160, display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e0e0e0", fontSize: 15, background: "#fafafa", outline: "none", cursor: "pointer" },
  swapBtn: { background: "#f0f4ff", border: "1.5px solid #c5d0f0", borderRadius: 50, width: 40, height: 40, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginBottom: 2 },
  searchBtn: { width: "100%", padding: "15px 0", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 },
  popularSection: { marginTop: 8 },
  popularTitle: { fontSize: 20, fontWeight: 700, color: "#1a1a2e", marginBottom: 16 },
  routeGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 },
  routeCard: { background: "#fff", border: "1.5px solid #e8e8e8", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "box-shadow 0.2s", flexWrap: "wrap" },
  routeFrom: { fontWeight: 700, color: "#1a1a2e", fontSize: 15 },
  routeArrow: { color: "#e63946", fontWeight: 700 },
  routeTo: { fontWeight: 700, color: "#1a1a2e", fontSize: 15, flex: 1 },
  routePrice: { fontSize: 13, color: "#e63946", fontWeight: 600, background: "#fff0f1", padding: "3px 10px", borderRadius: 20 },
};

export default BusSearch;