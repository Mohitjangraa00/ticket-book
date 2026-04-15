import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const TripPlanner = () => {
  const navigate = useNavigate();
  const [query, setQuery]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [plan, setPlan]         = useState(null);
  const [error, setError]       = useState("");

  const SUGGESTIONS = [
    "Plan a 3-day trip from Delhi to Goa under ₹15,000",
    "Weekend trip from Mumbai to Pune, 2 people, budget ₹5,000",
    "Best trains from Chandigarh to Delhi this weekend",
    "Family trip to Shimla for 4 days, 2 adults 1 child",
  ];

  const handlePlan = async () => {
    if (!query.trim()) { setError("Please describe your trip"); return; }
    setError("");
    setLoading(true);
    setPlan(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `You are a smart Indian travel assistant for a ticket booking app called "Ticket Counter" that books trains, flights, and buses.

User request: "${query}"

Respond ONLY with a JSON object (no markdown, no backticks) in this exact format:
{
  "title": "Trip title",
  "summary": "2-sentence overview",
  "budget": "Total estimated cost in ₹",
  "duration": "e.g. 3 days",
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": ["activity 1", "activity 2"]
    }
  ],
  "transport": [
    {
      "type": "flight|train|bus",
      "from": "city code",
      "to": "city code",
      "suggestion": "e.g. IndiGo 6E-201 or Rajdhani Express",
      "estimatedCost": "₹4,299",
      "bookPath": "/flights or /trains or /bus"
    }
  ],
  "tips": ["tip 1", "tip 2", "tip 3"]
}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";

      try {
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        setPlan(parsed);
      } catch {
        setError("Could not parse the plan. Please try rephrasing your request.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const typeIcon = (type) => {
    if (type === "flight") return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
      </svg>
    );
    if (type === "train") return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <path d="M4 11V7a2 2 0 012-2h12a2 2 0 012 2v4" />
        <path d="M3 11h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6z" />
        <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
      </svg>
    );
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="3" y1="11" x2="21" y2="11" />
      </svg>
    );
  };

  const typeColor = { flight: "#E6F1FB", train: "#EAF3DE", bus: "#FAEEDA" };
  const typeText  = { flight: "#0C447C", train: "#27500A", bus: "#633806" };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative overflow-hidden pb-16 pt-5 px-5"
        style={{ background: "linear-gradient(135deg, #26215C 0%, #534AB7 55%, #7F77DD 100%)", borderRadius: "0 0 24px 24px" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <button onClick={() => navigate(-1)} className="relative flex items-center gap-1.5 mb-5 text-sm"
          style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-5 h-5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-white">AI trip planner</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
              Describe your trip — AI plans it instantly
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 -mt-8">

        {/* Input card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 mb-3">
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            Describe your trip
          </p>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Plan a 3-day trip from Delhi to Goa under ₹15,000 for 2 people"
            rows={3}
            className="w-full text-sm border border-gray-200 rounded-xl p-3 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 resize-none text-gray-800 placeholder-gray-400"
          />

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

          <button onClick={handlePlan} disabled={loading}
            className="w-full mt-3 py-3 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #534AB7, #7F77DD)" }}>
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
                </svg>
                Planning your trip...
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Plan my trip with AI
              </>
            )}
          </button>
        </motion.div>

        {/* Quick suggestions */}
        {!plan && !loading && (
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">Try these</p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setQuery(s)}
                  className="text-left text-xs px-3 py-2.5 bg-white rounded-xl border border-gray-100 text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-all">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Plan result */}
        {plan && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="flex items-start justify-between mb-2">
                <p className="text-base font-medium text-gray-800">{plan.title}</p>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-800 flex-shrink-0 ml-2">
                  {plan.duration}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{plan.summary}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Estimated budget</span>
                <span className="text-sm font-medium text-gray-800">{plan.budget}</span>
              </div>
            </div>

            {/* Transport options */}
            {plan.transport?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Suggested transport</p>
                <div className="space-y-2">
                  {plan.transport.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: typeColor[t.type] || "#f9fafb" }}>
                      <div className="flex items-center gap-2.5">
                        <span style={{ color: typeText[t.type] || "#374151" }}>{typeIcon(t.type)}</span>
                        <div>
                          <p className="text-xs font-medium" style={{ color: typeText[t.type] || "#374151" }}>
                            {t.from} → {t.to}
                          </p>
                          <p className="text-xs" style={{ color: typeText[t.type] || "#6b7280", opacity: 0.8 }}>
                            {t.suggestion}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: typeText[t.type] }}>
                          {t.estimatedCost}
                        </span>
                        <button onClick={() => navigate(t.bookPath)}
                          className="text-xs px-2.5 py-1 rounded-lg font-medium text-white"
                          style={{ background: typeText[t.type] || "#185FA5" }}>
                          Book
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day-by-day plan */}
            {plan.days?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Day-by-day plan</p>
                <div className="space-y-3">
                  {plan.days.map((day) => (
                    <div key={day.day}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ background: "#534AB7" }}>
                          {day.day}
                        </div>
                        <p className="text-sm font-medium text-gray-800">{day.title}</p>
                      </div>
                      <div className="ml-8 space-y-1">
                        {day.activities.map((a, i) => (
                          <p key={i} className="text-xs text-gray-500 flex items-start gap-1.5">
                            <span className="mt-1 w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />
                            {a}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {plan.tips?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Travel tips</p>
                <div className="space-y-2">
                  {plan.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: "#EEEDFE" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#534AB7" strokeWidth="2.5" className="w-2.5 h-2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <p className="text-xs text-gray-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Plan again */}
            <button onClick={() => { setPlan(null); setQuery(""); }}
              className="w-full py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 bg-white">
              Plan another trip
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default TripPlanner;