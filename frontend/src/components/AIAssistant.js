import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const QUICK_PROMPTS = [
  "Cheapest train to Mumbai this week",
  "Best time to book flights to Goa",
  "How do I cancel my booking?",
  "Check my PNR status",
];

const AIAssistant = () => {
  const navigate    = useNavigate();
  const [open, setOpen]         = useState(false);
  const [input, setInput]       = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your Ticket Counter assistant. I can help you find trains, flights, plan trips, or answer questions. What do you need?",
    },
  ]);
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const sendMessage = async (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput("");

    const updated = [...messages, { role: "user", content: userMsg }];
    setMessages(updated);
    setLoading(true);

    try {
      const history = updated.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a helpful assistant for "Ticket Counter", an Indian travel booking app for trains, flights, and buses.

Your capabilities:
- Help users find trains, flights, buses between Indian cities
- Suggest best routes, travel times, prices
- Explain how to book, cancel, check PNR status
- Plan trips with budget estimates

App routes you can suggest:
- Search trains: /trains
- Search flights: /flights  
- Check PNR: /pnr-status
- My bookings: /bookings
- AI trip planner: /trip-planner

Keep responses concise (2-3 sentences max). If suggesting navigation, end with ACTION:{"path":"/route","label":"Button text"}.
Example: "You can search for trains here. ACTION:{"path":"/trains","label":"Search trains"}"`,
          messages: history,
        }),
      });

      const data = await res.json();
      let reply = data.content?.[0]?.text || "Sorry, I couldn't process that. Please try again.";

      // Extract action if present
      let action = null;
      const actionMatch = reply.match(/ACTION:(\{.*?\})/);
      if (actionMatch) {
        try {
          action = JSON.parse(actionMatch[1]);
          reply = reply.replace(/ACTION:\{.*?\}/, "").trim();
        } catch { /* ignore */ }
      }

      setMessages([...updated, { role: "assistant", content: reply, action }]);
    } catch {
      setMessages([...updated, {
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full text-white flex items-center justify-center z-50 transition-all"
        style={{ background: "linear-gradient(135deg, #534AB7, #7F77DD)", boxShadow: "0 4px 20px rgba(83,74,183,0.4)" }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.svg key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </motion.svg>
          ) : (
            <motion.svg key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-6 h-6">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </motion.svg>
          )}
        </AnimatePresence>
      </button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl border border-gray-100 z-50 flex flex-col overflow-hidden"
            style={{ height: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.12)" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2.5"
              style={{ background: "linear-gradient(135deg, #534AB7, #7F77DD)" }}>
              <div className="w-7 h-7 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="w-4 h-4">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">AI assistant</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>Powered by Claude</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "text-white rounded-br-sm"
                      : "bg-gray-50 text-gray-700 rounded-bl-sm border border-gray-100"
                  }`}
                    style={msg.role === "user" ? { background: "#534AB7" } : {}}>
                    {msg.content}
                    {msg.action && (
                      <button onClick={() => { navigate(msg.action.path); setOpen(false); }}
                        className="mt-2 w-full py-1.5 rounded-lg text-xs font-medium text-white block text-center"
                        style={{ background: "#534AB7" }}>
                        {msg.action.label} →
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 px-3 py-2 rounded-2xl rounded-bl-sm flex gap-1">
                    {[0,1,2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400"
                        style={{ animation: `bounce 1s infinite ${i * 0.2}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((q) => (
                  <button key={q} onClick={() => sendMessage(q)}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-all bg-white">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-1 border-t border-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
                  placeholder="Ask anything..."
                  className="flex-1 text-xs border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400"
                />
                <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                  style={{ background: "#534AB7" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
    </>
  );
};

export default AIAssistant;