import { useState, useRef } from "react";

/**
 * useVoiceSearch
 * Listens for spoken station route and class, then calls onResult(transcript).
 * Works in Chrome / Edge. Silently no-ops in unsupported browsers.
 *
 * Usage:
 *   const { listening, startListening, stopListening, supported } = useVoiceSearch((text) => {
 *     // parse text and prefill form
 *   });
 */
const useVoiceSearch = (onResult) => {
  const [listening, setListening] = useState(false);
  const [supported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );
  const recognitionRef = useRef(null);

  const startListening = () => {
    if (!supported) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";        // Indian English — handles station names better
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  return { listening, startListening, stopListening, supported };
};

/**
 * parseVoiceTranscript
 * Extracts from, to, date, and class from a spoken string.
 * Examples it handles:
 *   "Delhi to Mumbai sleeper class"
 *   "Chandigarh to New Delhi 3AC tomorrow"
 *   "Book train from Pune to Bengaluru on 20 April first class"
 */
export const parseVoiceTranscript = (transcript, stations) => {
  const lower = transcript.toLowerCase();
  const result = {};

  // Route: "X to Y" or "from X to Y"
  const routeMatch = lower.match(/(?:from\s+)?(.+?)\s+to\s+(.+?)(?:\s+on|\s+for|\s+sleeper|\s+3ac|\s+2ac|\s+1ac|\s+chair|$)/);
  if (routeMatch) {
    const fromQuery = routeMatch[1].trim();
    const toQuery = routeMatch[2].trim();

    const fromStation = stations.find(
      (s) =>
        s.name.toLowerCase().includes(fromQuery) ||
        s.code.toLowerCase() === fromQuery
    );
    const toStation = stations.find(
      (s) =>
        s.name.toLowerCase().includes(toQuery) ||
        s.code.toLowerCase() === toQuery
    );

    if (fromStation) result.from = fromStation;
    if (toStation) result.to = toStation;
  }

  // Class keywords
  if (lower.includes("sleeper") || lower.includes("sl")) result.classType = "SL";
  else if (lower.includes("3ac") || lower.includes("three ac") || lower.includes("3 ac")) result.classType = "3A";
  else if (lower.includes("2ac") || lower.includes("two ac") || lower.includes("2 ac")) result.classType = "2A";
  else if (lower.includes("first class") || lower.includes("1ac") || lower.includes("1 ac")) result.classType = "1A";
  else if (lower.includes("chair")) result.classType = "CC";

  // Date keywords
  const today = new Date();
  if (lower.includes("today")) {
    result.date = today.toISOString().split("T")[0];
  } else if (lower.includes("tomorrow")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    result.date = tomorrow.toISOString().split("T")[0];
  }

  return result;
};

export default useVoiceSearch;
