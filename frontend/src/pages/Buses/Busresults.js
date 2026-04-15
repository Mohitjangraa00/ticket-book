import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BusCard from "./Buscard";

// Mock bus data generator
const generateBuses = (from, to, busType) => {
  const operators = [
    { name: "RedBus Express", rating: 4.5, type: "ac_sleeper" },
    { name: "VRL Travels", rating: 4.3, type: "volvo" },
    { name: "SRS Travels", rating: 4.1, type: "non_ac_sleeper" },
    { name: "Orange Tours", rating: 4.6, type: "ac_seater" },
    { name: "Parveen Travels", rating: 3.9, type: "non_ac_seater" },
    { name: "Kallada Travels", rating: 4.4, type: "ac_sleeper" },
    { name: "IntrCity SmartBus", rating: 4.7, type: "volvo" },
    { name: "ZingBus", rating: 4.2, type: "ac_seater" },
  ];

  return operators
    .filter((op) => busType === "all" || op.type === busType)
    .map((op, i) => {
      const deptHour = 6 + i * 2;
      const duration = 5 + Math.floor(Math.random() * 7);
      const arrHour = (deptHour + duration) % 24;
      const totalSeats = op.type.includes("sleeper") ? 36 : 45;
      const available = Math.floor(Math.random() * 20) + 5;
      const price = 200 + i * 150 + Math.floor(Math.random() * 100);

      return {
        id: `bus_${i}`,
        operator: op.name,
        rating: op.rating,
        type: op.type,
        from,
        to,
        departure: `${String(deptHour).padStart(2, "0")}:00`,
        arrival: `${String(arrHour).padStart(2, "0")}:${Math.random() > 0.5 ? "30" : "00"}`,
        duration: `${duration}h ${Math.random() > 0.5 ? "30" : "00"}m`,
        price,
        totalSeats,
        availableSeats: available,
        amenities: ["WiFi", "Charging Point", "Blanket"].slice(0, Math.floor(Math.random() * 3) + 1),
        liveTracking: Math.random() > 0.4,
      };
    });
};

const BUS_TYPE_LABELS = {
  ac_sleeper: "AC Sleeper",
  non_ac_sleeper: "Non-AC Sleeper",
  ac_seater: "AC Seater",
  non_ac_seater: "Non-AC Seater",
  volvo: "Volvo / Multi-Axle",
  all: "All",
};

const BusResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchData = location.state || {};

  const [buses, setBuses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sortBy, setSortBy] = useState("price");
  const [filters, setFilters] = useState({ types: [], maxPrice: 2000, rating: 0 });

  useEffect(() => {
    const data = generateBuses(searchData.from, searchData.to, searchData.busType || "all");
    setBuses(data);
    setFiltered(data);
  }, []);

  useEffect(() => {
    let result = [...buses];
    if (filters.types.length > 0) result = result.filter((b) => filters.types.includes(b.type));
    result = result.filter((b) => b.price <= filters.maxPrice && b.rating >= filters.rating);
    if (sortBy === "price") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "departure") result.sort((a, b) => a.departure.localeCompare(b.departure));
    else if (sortBy === "duration") result.sort((a, b) => a.duration.localeCompare(b.duration));
    setFiltered(result);
  }, [buses, sortBy, filters]);

  const toggleType = (type) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type) ? prev.types.filter((t) => t !== type) : [...prev.types, type],
    }));
  };

  const handleSelect = (bus) => {
    navigate("/buses/seat-selection", { state: { bus, searchData } });
  };

  return (
    <div style={styles.wrapper}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate("/buses")} style={styles.backBtn}>← Back</button>
        <div>
          <h2 style={styles.title}>{searchData.from} → {searchData.to}</h2>
          <p style={styles.subtitle}>{searchData.date} · {searchData.passengers} Passenger{searchData.passengers > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={styles.layout}>
        {/* Filters Sidebar */}
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Filters</h3>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Bus Type</label>
            {Object.entries(BUS_TYPE_LABELS).filter(([k]) => k !== "all").map(([key, label]) => (
              <label key={key} style={styles.checkboxLabel}>
                <input type="checkbox" checked={filters.types.includes(key)} onChange={() => toggleType(key)} />
                {label}
              </label>
            ))}
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Max Price: ₹{filters.maxPrice}</label>
            <input
              type="range" min={200} max={3000} step={100}
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Min Rating: {filters.rating}★</label>
            <input
              type="range" min={0} max={5} step={0.5}
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: Number(e.target.value) })}
              style={{ width: "100%" }}
            />
          </div>

          <button onClick={() => setFilters({ types: [], maxPrice: 2000, rating: 0 })} style={styles.clearBtn}>
            Clear Filters
          </button>
        </aside>

        {/* Results */}
        <main style={styles.main}>
          {/* Sort Bar */}
          <div style={styles.sortBar}>
            <span style={styles.resultCount}>{filtered.length} buses found</span>
            <div style={styles.sortButtons}>
              {["price", "rating", "departure", "duration"].map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  style={{ ...styles.sortBtn, ...(sortBy === s ? styles.sortBtnActive : {}) }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div style={styles.noResult}>
              <p>🚌 No buses found for the selected filters.</p>
              <button onClick={() => setFilters({ types: [], maxPrice: 2000, rating: 0 })} style={styles.clearBtn}>Reset Filters</button>
            </div>
          ) : (
            filtered.map((bus) => (
              <BusCard key={bus.id} bus={bus} onSelect={() => handleSelect(bus)} />
            ))
          )}
        </main>
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
  layout: { display: "flex", gap: 24 },
  sidebar: { width: 220, flexShrink: 0, background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", alignSelf: "flex-start", position: "sticky", top: 20 },
  sidebarTitle: { fontSize: 16, fontWeight: 700, color: "#1a1a2e", marginBottom: 16, marginTop: 0 },
  filterGroup: { marginBottom: 20 },
  filterLabel: { fontSize: 12, fontWeight: 700, color: "#555", textTransform: "uppercase", letterSpacing: 0.5, display: "block", marginBottom: 8 },
  checkboxLabel: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#333", marginBottom: 6, cursor: "pointer" },
  clearBtn: { width: "100%", padding: "10px 0", background: "#f5f5f5", border: "1.5px solid #ddd", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#555" },
  main: { flex: 1 },
  sortBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  resultCount: { fontSize: 14, color: "#666", fontWeight: 600 },
  sortButtons: { display: "flex", gap: 8 },
  sortBtn: { padding: "6px 14px", borderRadius: 20, border: "1.5px solid #ddd", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#555" },
  sortBtnActive: { background: "#e63946", color: "#fff", borderColor: "#e63946" },
  noResult: { textAlign: "center", padding: 40, background: "#fff", borderRadius: 14, color: "#666", fontSize: 16 },
};

export default BusResults;