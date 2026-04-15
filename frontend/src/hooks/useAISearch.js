/**
 * useAISearch.js
 * Parses natural language into structured booking form data.
 * 
 * Example inputs it handles:
 *   "Delhi to Mumbai tomorrow sleeper class"
 *   "Flight from Goa to Delhi next Friday business class 2 people"
 *   "Cheap trains from Chandigarh to Delhi this weekend"
 */

import { useState } from "react";

const useAISearch = () => {
  const [parsing, setParsing] = useState(false);

  const parseQuery = async (text) => {
    if (!text.trim()) return null;
    setParsing(true);

    try {
      const today = new Date().toISOString().split("T")[0];

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Extract travel booking details from this query. Today is ${today}.

Query: "${text}"

Respond ONLY with JSON (no markdown, no explanation):
{
  "type": "train|flight|bus",
  "from": "city name or IATA/station code",
  "to": "city name or IATA/station code", 
  "date": "YYYY-MM-DD or null",
  "passengers": 1,
  "cabin": "economy|business|first or null",
  "classType": "SL|3A|2A|1A|CC or null",
  "confidence": 0.0-1.0
}

Rules:
- If ambiguous between train/flight, prefer train for Indian domestic short routes (<500km), flight for long routes
- For dates: "tomorrow" = ${new Date(Date.now() + 86400000).toISOString().split("T")[0]}, "next Friday" = calculate from today
- Use null for fields not mentioned
- Common city codes: Delhi=DEL/NDLS, Mumbai=BOM/MMCT, Bangalore=BLR/SBC, Chennai=MAA/MAS, Kolkata=CCU/HWH, Hyderabad=HYD/SC, Goa=GOI, Chandigarh=IXC/CDG`,
            },
          ],
        }),
      });

      const data = await res.json();
      const text2 = data.content?.[0]?.text || "";
      const clean = text2.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      return null;
    } finally {
      setParsing(false);
    }
  };

  return { parseQuery, parsing };
};

export default useAISearch;