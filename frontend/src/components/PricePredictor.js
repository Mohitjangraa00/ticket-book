import { useState } from "react";
import { motion } from "framer-motion";

/**
 * PricePredictor
 * Uses AI to predict whether flight/train price will go up or down
 * and gives the best time to book.
 * 
 * Usage: <PricePredictor from="DEL" to="BOM" date="2026-05-15" type="flight" currentPrice={4299} />
 */
const PricePredictor = ({ from, to, date, type = "flight", currentPrice }) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading]       = useState(false);

  const predict = async () => {
    setLoading(true);
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
              content: `You are a travel price prediction expert for Indian travel.

Route: ${from} → ${to}
Travel date: ${date}
Transport type: ${type}
Current price: ₹${currentPrice}
Today's date: ${new Date().toISOString().split("T")[0]}

Predict price trend and give booking advice. Respond ONLY with JSON:
{
  "trend": "up|down|stable",
  "confidence": "high|medium|low",
  "predictedChange": "+10%|-15%|stable",
  "bestTimeToBook": "e.g. Book now, prices rising" or "Wait 2-3 days",
  "reason": "One sentence explanation",
  "urgency": "high|medium|low",
  "tip": "One actionable tip"
}`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setPrediction(JSON.parse(clean));
    } catch {
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  const trendColor = {
    up:     { bg: "#FCEBEB", text: "#A32D2D", icon: "↑" },
    down:   { bg: "#EAF3DE", text: "#27500A", icon: "↓" },
    stable: { bg: "#E6F1FB", text: "#0C447C", icon: "→" },
  };

  const urgencyColor = {
    high:   { bg: "#FCEBEB", text: "#A32D2D" },
    medium: { bg: "#FAEEDA", text: "#633806" },
    low:    { bg: "#EAF3DE", text: "#27500A" },
  };

  if (!prediction && !loading) {
    return (
      <button onClick={predict}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        Predict price trend
      </button>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-purple-600 bg-purple-50 border border-purple-100">
        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M2 12h4M18 12h4" />
        </svg>
        Analysing price trends...
      </div>
    );
  }

  const tc = trendColor[prediction.trend] || trendColor.stable;
  const uc = urgencyColor[prediction.urgency] || urgencyColor.low;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-purple-100 overflow-hidden" style={{ background: "#FAFAFE" }}>
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-purple-50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: tc.bg, color: tc.text }}>
            {tc.icon} Price {prediction.trend}
          </span>
          <span className="text-xs text-gray-400">{prediction.predictedChange}</span>
        </div>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: uc.bg, color: uc.text }}>
          {prediction.urgency === "high" ? "Book now" : prediction.urgency === "medium" ? "Book soon" : "Can wait"}
        </span>
      </div>
      <div className="px-3 py-2.5">
        <p className="text-xs font-medium text-gray-700 mb-1">{prediction.bestTimeToBook}</p>
        <p className="text-xs text-gray-500">{prediction.reason}</p>
        {prediction.tip && (
          <p className="text-xs text-purple-600 mt-1.5 flex items-start gap-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {prediction.tip}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PricePredictor;