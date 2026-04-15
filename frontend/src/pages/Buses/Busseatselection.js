import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const generateSeats = (type) => {
  const rows = 10;
  const cols = ["A", "B", "C", "D"];
  const seats = [];
  for (let r = 1; r <= rows; r++) {
    for (let c of cols) {
      const rand = Math.random();
      const status = rand < 0.30 ? "booked" : rand < 0.38 ? "ladies" : "available";
      seats.push({ id: `${r}${c}`, row: r, col: c, status });
    }
  }
  return seats;
};

const scoreSeats = (seats, prefs, count) => {
  const avail = seats.filter((s) => s.status === "available");
  const ROWS = 10;
  const score = (s) => {
    let sc = 0;
    const isWindow = s.col === "A" || s.col === "D";
    const isAisle  = s.col === "B" || s.col === "C";
    if (prefs.position === "window" && isWindow) sc += 10;
    if (prefs.position === "aisle"  && isAisle)  sc += 10;
    if (prefs.location === "front")  sc += ROWS - s.row;
    if (prefs.location === "back")   sc += s.row;
    if (prefs.location === "middle") sc += ROWS - Math.abs(s.row - Math.floor(ROWS / 2)) * 2;
    return sc;
  };

  if (count === 1) return [avail.sort((a, b) => score(b) - score(a))[0]?.id].filter(Boolean);

  if (prefs.together) {
    const COLS = ["A", "B", "C", "D"];
    let best = null, bestScore = -1;
    for (let i = 0; i < avail.length; i++) {
      for (let j = i + 1; j < avail.length; j++) {
        const a = avail[i], b = avail[j];
        const sameRow = a.row === b.row;
        const colDiff = Math.abs(COLS.indexOf(a.col) - COLS.indexOf(b.col)) === 1;
        const notAcrossAisle = !((a.col === "B" && b.col === "C") || (a.col === "C" && b.col === "B"));
        if (sameRow && colDiff && notAcrossAisle) {
          const sc = score(a) + score(b);
          if (sc > bestScore) { bestScore = sc; best = [a.id, b.id]; }
        }
      }
    }
    if (best) return best;
  }
  return avail.sort((a, b) => score(b) - score(a)).slice(0, count).map((s) => s.id);
};

const BusSeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bus, searchData } = location.state || {};
  const maxSeats = searchData?.passengers || 2;

  const [seats] = useState(() => generateSeats(bus?.type || "ac_seater"));
  const [selected, setSelected] = useState([]);
  const [aiHighlighted, setAiHighlighted] = useState([]);
  const [prefs, setPrefs] = useState({ position: "window", location: "front", together: true });
  const [messages, setMessages] = useState([
    { role: "ai", text: `Hi! I can find the best ${maxSeats} seat${maxSeats > 1 ? "s" : ""} for you. Set your preferences or describe what you need.` },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, thinking]);

  const updatePref = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));
  const addMsg = (role, text) => setMessages((m) => [...m, { role, text }]);

  const runSuggest = (currentPrefs = prefs) => {
    const suggested = scoreSeats(seats, currentPrefs, maxSeats);
    setAiHighlighted(suggested);
    setSelected([]);
    const posLabel = currentPrefs.position !== "any" ? `${currentPrefs.position} ` : "";
    const togLabel = maxSeats > 1 ? (currentPrefs.together ? ", adjacent" : ", separate") : "";
    addMsg("ai", `I've highlighted seat${suggested.length > 1 ? "s" : ""} ${suggested.join(" & ")} — ${posLabel}seats in the ${currentPrefs.location}${togLabel}. Click them to confirm!`);
  };

  const handleChat = (msg) => {
    if (!msg.trim()) return;
    addMsg("user", msg);
    setInput("");
    setThinking(true);
    const lower = msg.toLowerCase();
    let newPrefs = { ...prefs };
    let reply = "Try: 'window seat', 'front rows', 'quiet', 'together', or click Suggest best seats!";
    let doSuggest = false;

    if (lower.includes("window"))  { newPrefs.position = "window";  reply = "Window seats set!"; }
    else if (lower.includes("aisle")) { newPrefs.position = "aisle"; reply = "Aisle seats set!"; }
    if (lower.includes("front"))   { newPrefs.location  = "front";  reply = "Front section preferred."; }
    else if (lower.includes("back"))  { newPrefs.location = "back";  reply = "Back rows preferred."; }
    else if (lower.includes("middle")){newPrefs.location = "middle"; reply = "Middle section set."; }
    if (lower.includes("together") || lower.includes("adjacent")) { newPrefs.together = true; reply = "I'll find adjacent seats!"; }
    if (lower.includes("suggest") || lower.includes("recommend") || lower.includes("best") || lower.includes("pick")) doSuggest = true;
    if (lower.includes("quiet"))   reply = "Quieter seats are usually in the front, away from the engine. Want me to suggest front seats?";
    if (lower.includes("help"))    reply = "You can say: 'window seat', 'front rows', 'together', 'suggest best seats', or just click the green button below.";

    setPrefs(newPrefs);
    setTimeout(() => {
      setThinking(false);
      if (doSuggest) { runSuggest(newPrefs); }
      else { addMsg("ai", reply); }
    }, 600);
  };

  const handleSuggest = () => {
    addMsg("user", `Find ${maxSeats > 1 ? maxSeats + " " : ""}${prefs.position !== "any" ? prefs.position + " " : ""}seat${maxSeats > 1 ? "s" : ""} in the ${prefs.location}${maxSeats > 1 && prefs.together ? " together" : ""}`);
    setThinking(true);
    setTimeout(() => { setThinking(false); runSuggest(); }, 700);
  };

  const toggleSeat = (seat) => {
    if (seat.status === "booked" || seat.status === "ladies") return;
    const id = seat.id;
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else if (aiHighlighted.includes(id)) {
      const newSel = [...selected, id];
      setSelected(newSel);
      setAiHighlighted(aiHighlighted.filter((s) => s !== id));
      if (newSel.length === maxSeats) addMsg("ai", `Seats ${newSel.join(" & ")} confirmed! Tap Continue when ready.`);
    } else {
      if (selected.length >= maxSeats) { addMsg("ai", `You already have ${maxSeats} seat${maxSeats > 1 ? "s" : ""} selected. Deselect one first.`); return; }
      setSelected([...selected, id]);
    }
  };

  const getSeatStyle = (seat) => {
    if (selected.includes(seat.id))     return { ...s.seat, background: "#1565c0", border: "1.5px solid #1565c0", color: "#fff" };
    if (aiHighlighted.includes(seat.id) && seat.status === "available")
                                         return { ...s.seat, background: "#0F6E56", border: "2px solid #0F6E56", color: "#fff", boxShadow: "0 0 0 3px rgba(15,110,86,0.2)" };
    if (seat.status === "ladies")        return { ...s.seat, background: "#f8bbd0", border: "1.5px solid #f48fb1", color: "#880e4f", cursor: "not-allowed", opacity: 0.75 };
    if (seat.status === "booked")        return { ...s.seat, background: "#efefef", border: "1.5px solid #ddd", color: "#bbb", cursor: "not-allowed" };
    return { ...s.seat, background: "#f4f4f4", border: "1.5px solid #ddd", color: "#666" };
  };

  const rows = {};
  seats.forEach((seat) => { if (!rows[seat.row]) rows[seat.row] = []; rows[seat.row].push(seat); });
  const totalPrice = selected.length * (bus?.price || 0);

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <button onClick={() => navigate(-1)} style={s.backBtn}>← Back</button>
        <div>
          <h2 style={s.title}>Select Seats</h2>
          <p style={s.subtitle}>{bus?.operator} · {bus?.from} → {bus?.to} · {maxSeats} Passenger{maxSeats > 1 ? "s" : ""}</p>
        </div>
      </div>

      <div style={s.layout}>
        {/* Seat Map */}
        <div style={s.seatPanel}>
          <div style={s.legend}>
            {[
              ["#1565c0","#1565c0","Selected"],
              ["#0F6E56","#0F6E56","AI pick"],
              ["#efefef","#ddd","Booked"],
              ["#f8bbd0","#f48fb1","Ladies"],
              ["#f4f4f4","#ddd","Available"],
            ].map(([bg, border, label]) => (
              <div key={label} style={s.legendItem}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: bg, border: `1.5px solid ${border}`, flexShrink: 0 }} />
                <span style={s.legendLabel}>{label}</span>
              </div>
            ))}
          </div>
          <div style={s.busFrame}>
            <div style={s.driverRow}><span style={{ fontSize: 20 }}>🚌</span></div>
            {Object.entries(rows).map(([row, rowSeats]) => (
              <div key={row} style={s.seatRow}>
                <span style={s.rowNum}>{row}</span>
                {rowSeats.slice(0, 2).map((seat) => (
                  <div key={seat.id} onClick={() => toggleSeat(seat)} style={getSeatStyle(seat)}>{seat.id}</div>
                ))}
                <div style={s.aisle} />
                {rowSeats.slice(2, 4).map((seat) => (
                  <div key={seat.id} onClick={() => toggleSeat(seat)} style={getSeatStyle(seat)}>{seat.id}</div>
                ))}
              </div>
            ))}
          </div>
          <div style={s.summaryBar}>
            {[
              ["Selected", `${selected.length} / ${maxSeats}`],
              ["Seats", selected.length ? selected.join(", ") : "—"],
              ["Total", `₹${totalPrice}`],
            ].map(([label, val]) => (
              <div key={label} style={s.summaryChip}>
                <span>{label}</span>
                <strong style={label === "Total" ? { color: "#c1121f" } : {}}>{val}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* AI Panel */}
        <div style={s.aiPanel}>
          <div style={s.aiHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#0F6E56" }} />
              <span style={s.aiTitle}>AI seat assistant</span>
            </div>
            <p style={s.aiSub}>Tell me your preferences or click suggest</p>
          </div>

          <div style={s.prefsArea}>
            <div style={s.prefRow}>
              <span style={s.prefLabel}>Position</span>
              <div style={s.chips}>
                {[["window","Window"],["aisle","Aisle"],["any","Any"]].map(([val, label]) => (
                  <button key={val} onClick={() => updatePref("position", val)}
                    style={{ ...s.chip, ...(prefs.position === val ? s.chipActive : {}) }}>{label}</button>
                ))}
              </div>
            </div>
            <div style={s.prefRow}>
              <span style={s.prefLabel}>Location</span>
              <div style={s.chips}>
                {[["front","Front"],["middle","Middle"],["back","Back"]].map(([val, label]) => (
                  <button key={val} onClick={() => updatePref("location", val)}
                    style={{ ...s.chip, ...(prefs.location === val ? s.chipActive : {}) }}>{label}</button>
                ))}
              </div>
            </div>
            {maxSeats > 1 && (
              <div style={s.prefRow}>
                <span style={s.prefLabel}>Together</span>
                <div style={s.chips}>
                  <button onClick={() => updatePref("together", true)}  style={{ ...s.chip, ...(prefs.together  ? s.chipActive : {}) }}>Yes</button>
                  <button onClick={() => updatePref("together", false)} style={{ ...s.chip, ...(!prefs.together ? s.chipActive : {}) }}>No</button>
                </div>
              </div>
            )}
          </div>

          <div style={s.chatArea} ref={chatRef}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...s.msg, ...(m.role === "user" ? s.msgUser : s.msgAi) }}>{m.text}</div>
            ))}
            {thinking && <div style={s.thinking}>Thinking...</div>}
          </div>

          <div style={s.suggestArea}>
            <button onClick={handleSuggest} style={s.suggestBtn}>✦ Suggest best seats</button>
          </div>
          <div style={s.chatInputRow}>
            <input value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleChat(input)}
              placeholder="e.g. quiet window seat..."
              style={s.chatInput} />
            <button onClick={() => handleChat(input)} style={s.sendBtn}>↑</button>
          </div>
        </div>

        {/* Continue sidebar */}
        <div style={s.sidebar}>
          <div style={s.sideCard}>
            <h3 style={s.sideTitle}>Booking Summary</h3>
            {[["From", bus?.from],["To", bus?.to],["Date", searchData?.date],["Departure", bus?.departure]].map(([label, val]) => (
              <div key={label} style={s.sideRow}><span>{label}</span><strong>{val}</strong></div>
            ))}
            <hr style={s.hr} />
            <div style={s.sideRow}><span>Seats</span><strong>{selected.length ? selected.join(", ") : "—"}</strong></div>
            <div style={s.sideRow}><span>Price/seat</span><strong>₹{bus?.price}</strong></div>
            <div style={s.sideRow}><span>Total</span><strong style={{ color: "#c1121f", fontSize: 18 }}>₹{totalPrice}</strong></div>
            <button
              disabled={selected.length < maxSeats}
              onClick={() => navigate("/buses/passenger-details", { state: { bus, searchData, selectedSeats: selected, totalPrice } })}
              style={{ ...s.continueBtn, opacity: selected.length < maxSeats ? 0.4 : 1 }}
            >
              Continue →
            </button>
            <p style={s.hint}>
              {selected.length < maxSeats ? `Select ${maxSeats - selected.length} more seat${maxSeats - selected.length > 1 ? "s" : ""}` : "All seats selected!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  wrapper: { maxWidth: 1200, margin: "0 auto", padding: "24px 16px", fontFamily: "'Segoe UI', sans-serif" },
  header: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  backBtn: { background: "none", border: "1.5px solid #ddd", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  title: { fontSize: 22, fontWeight: 700, color: "#1a1a2e", margin: 0 },
  subtitle: { color: "#888", fontSize: 14, margin: "4px 0 0" },
  layout: { display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" },
  seatPanel: { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", flexShrink: 0 },
  legend: { display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  legendItem: { display: "flex", alignItems: "center", gap: 5 },
  legendLabel: { fontSize: 11, color: "#666" },
  busFrame: { border: "1.5px solid #e8e8e8", borderRadius: 12, padding: 14 },
  driverRow: { display: "flex", justifyContent: "flex-end", marginBottom: 10, paddingBottom: 8, borderBottom: "1px dashed #eee" },
  seatRow: { display: "flex", alignItems: "center", gap: 5, marginBottom: 5 },
  rowNum: { width: 16, fontSize: 10, color: "#aaa", textAlign: "right", flexShrink: 0 },
  aisle: { width: 14, flexShrink: 0 },
  seat: { width: 34, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 600, cursor: "pointer", transition: "all 0.12s", userSelect: "none" },
  summaryBar: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  summaryChip: { background: "#f8f8f8", border: "1px solid #eee", borderRadius: 20, padding: "4px 12px", display: "flex", gap: 6, fontSize: 12, color: "#888", alignItems: "center" },
  aiPanel: { flex: 1, minWidth: 250, maxWidth: 290, background: "#fff", borderRadius: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", overflow: "hidden", maxHeight: 560 },
  aiHeader: { padding: "14px 16px 10px", borderBottom: "1px solid #f0f0f0" },
  aiTitle: { fontSize: 14, fontWeight: 700, color: "#1a1a2e" },
  aiSub: { fontSize: 11, color: "#999", margin: 0 },
  prefsArea: { padding: "12px 14px", borderBottom: "1px solid #f0f0f0", display: "flex", flexDirection: "column", gap: 8 },
  prefRow: { display: "flex", alignItems: "center", gap: 8 },
  prefLabel: { fontSize: 11, color: "#888", width: 58, flexShrink: 0 },
  chips: { display: "flex", gap: 5 },
  chip: { fontSize: 10, padding: "3px 9px", borderRadius: 20, border: "1px solid #e0e0e0", background: "#fff", color: "#666", cursor: "pointer", fontFamily: "inherit" },
  chipActive: { background: "#1565c0", borderColor: "#1565c0", color: "#fff" },
  chatArea: { flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 },
  msg: { padding: "8px 10px", borderRadius: 10, fontSize: 11, lineHeight: 1.5, maxWidth: "90%" },
  msgAi: { background: "#f5f5f5", color: "#333", alignSelf: "flex-start", borderBottomLeftRadius: 3 },
  msgUser: { background: "#1565c0", color: "#fff", alignSelf: "flex-end", borderBottomRightRadius: 3 },
  thinking: { fontSize: 10, color: "#aaa", fontStyle: "italic", alignSelf: "flex-start" },
  suggestArea: { padding: "10px 14px", borderTop: "1px solid #f0f0f0" },
  suggestBtn: { width: "100%", padding: "9px 0", background: "#0F6E56", color: "#fff", border: "none", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
  chatInputRow: { padding: "10px 14px", borderTop: "1px solid #f0f0f0", display: "flex", gap: 6 },
  chatInput: { flex: 1, padding: "7px 10px", fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 8, outline: "none", fontFamily: "inherit" },
  sendBtn: { padding: "7px 12px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" },
  sidebar: { width: 220, flexShrink: 0, position: "sticky", top: 20 },
  sideCard: { background: "#fff", borderRadius: 14, padding: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  sideTitle: { fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginTop: 0, marginBottom: 14 },
  sideRow: { display: "flex", justifyContent: "space-between", fontSize: 13, color: "#666", marginBottom: 8 },
  hr: { border: "none", borderTop: "1px solid #f0f0f0", margin: "10px 0" },
  continueBtn: { width: "100%", padding: "13px 0", background: "linear-gradient(135deg, #e63946, #c1121f)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 14, marginTop: 10, fontFamily: "inherit" },
  hint: { fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 8, marginBottom: 0 },
};

export default BusSeatSelection;