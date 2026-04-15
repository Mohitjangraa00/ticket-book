import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const FlightConfirmation = () => {
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const boardingRef = useRef(null);

  const { booking, flight, search } = state || {};
  if (!booking) { navigate("/flights"); return null; }

  const isConfirmed = booking.status === "CONFIRMED";

  const downloadBoardingPass = async () => {
    const el = boardingRef.current;
    if (!el) return;
    const canvas  = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf     = new jsPDF("p", "mm", "a4");
    const width   = pdf.internal.pageSize.getWidth();
    const height  = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`boarding-pass-${booking.pnr}.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="relative overflow-hidden pb-14 pt-5 px-5"
        style={{
          background: isConfirmed
            ? "linear-gradient(135deg, #173404 0%, #27500A 55%, #3B6D11 100%)"
            : "linear-gradient(135deg, #412402 0%, #633806 55%, #854F0B 100%)",
          borderRadius: "0 0 24px 24px",
        }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="relative flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
            style={{ background: "rgba(255,255,255,0.2)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7">
              {isConfirmed
                ? <polyline points="20 6 9 17 4 12" />
                : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              }
            </svg>
          </div>
          <p className="text-white text-xl font-medium">
            {isConfirmed ? "Booking confirmed!" : "Booking waitlisted"}
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            {isConfirmed ? "Your boarding pass is ready." : "You'll be notified on confirmation."}
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Printable boarding pass */}
        <div ref={boardingRef} className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">

          {/* Header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">{flight?.airline}</p>
              <p className="text-xs text-gray-400">{flight?.flightNo} · {search?.cabin}</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: isConfirmed ? "#EAF3DE" : "#FAEEDA", color: isConfirmed ? "#27500A" : "#633806" }}>
              {booking.status}
            </span>
          </div>

          {/* PNR / Booking ref */}
          <div className="px-5 py-4 border-b border-gray-50" style={{ background: "#E6F1FB" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#185FA5" }}>
              Booking reference
            </p>
            <p className="text-2xl font-medium tracking-widest" style={{ color: "#0C447C" }}>{booking.pnr}</p>
          </div>

          {/* Route */}
          <div className="px-5 py-5 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-medium text-gray-800">{search?.from}</p>
                <p className="text-xs text-gray-400 mt-1">{flight?.departTime}</p>
                <p className="text-xs text-gray-400">{search?.date}</p>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1 mx-6">
                <svg viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.5" className="w-6 h-6">
                  <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
                <p className="text-xs text-gray-400">{flight?.duration}</p>
                <p className="text-xs text-gray-400">{flight?.stops}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-medium text-gray-800">{search?.to}</p>
                <p className="text-xs text-gray-400 mt-1">{flight?.arrivalTime}</p>
              </div>
            </div>
          </div>

          {/* Seat info */}
          {booking.seatInfo && (
            <div className="grid grid-cols-3 divide-x divide-gray-50 border-b border-gray-50">
              {[
                { label: "Seat",  value: booking.seatInfo },
                { label: "Class", value: search?.cabin },
                { label: "Gate",  value: booking.gate || "TBA" },
              ].map((item) => (
                <div key={item.label} className="px-4 py-3 text-center">
                  <p className="text-xs text-gray-400">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5 capitalize">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Passengers */}
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Passengers</p>
            {booking.passengers?.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.age} yrs · {p.gender} · {p.meal}</p>
                </div>
                <p className="text-xs font-medium text-gray-500">{p.seat}</p>
              </div>
            ))}
          </div>

          {/* Fare */}
          <div className="px-5 py-3">
            <div className="flex justify-between">
              <p className="text-sm text-gray-400">Total paid</p>
              <p className="text-sm font-medium text-gray-800">₹{booking.fare?.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button onClick={downloadBoardingPass}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 mb-2.5"
          style={{ background: "#185FA5" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download boarding pass PDF
        </button>

        <button onClick={() => navigate("/flights/pnr-status", { state: { pnr: booking.pnr } })}
          className="w-full py-3.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 flex items-center justify-center gap-2 mb-2.5 bg-white">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Check flight status
        </button>

        <button onClick={() => navigate("/dashboard")}
          className="w-full py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Back to dashboard
        </button>
      </div>
    </motion.div>
  );
};

export default FlightConfirmation;