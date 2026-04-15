import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const STATUS_STYLE = {
  CONFIRMED: { bg: "#EAF3DE", text: "#27500A", label: "Confirmed" },
  WAITING:   { bg: "#FAEEDA", text: "#633806", label: "Waiting List" },
  CANCELLED: { bg: "#FCEBEB", text: "#791F1F", label: "Cancelled" },
};

const BookingConfirmation = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const ticketRef  = useRef(null);

  const { booking, train, search } = state || {};
  if (!booking) { navigate("/trains"); return null; }

  const st = STATUS_STYLE[booking.status] || STATUS_STYLE.CONFIRMED;

  const downloadPDF = async () => {
    const el = ticketRef.current;
    if (!el) return;

    const canvas  = await html2canvas(el, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    const pdf     = new jsPDF("p", "mm", "a4");
    const width   = pdf.internal.pageSize.getWidth();
    const height  = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save(`ticket-${booking.pnr}.pdf`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Hero — green for confirmed, amber for waiting */}
      <div
        className="relative overflow-hidden pb-14 pt-5 px-5"
        style={{
          background: booking.status === "WAITING"
            ? "linear-gradient(135deg, #412402 0%, #633806 55%, #854F0B 100%)"
            : "linear-gradient(135deg, #173404 0%, #27500A 55%, #3B6D11 100%)",
          borderRadius: "0 0 24px 24px",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white bg-opacity-20 flex items-center justify-center mb-3">
            {booking.status === "CONFIRMED" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-7 h-7">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </div>
          <p className="text-white text-xl font-medium">
            {booking.status === "CONFIRMED" ? "Booking confirmed!" : "On waiting list"}
          </p>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
            {booking.status === "CONFIRMED"
              ? "Your ticket is ready. Download below."
              : "You'll be notified if confirmed."}
          </p>
        </div>
      </div>

      <div className="px-4 pb-8 -mt-5">

        {/* Printable ticket */}
        <div ref={ticketRef} className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-3">

          {/* Ticket header */}
          <div className="px-5 py-4 flex items-center justify-between border-b border-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-800">{train?.TrainName || train?.name}</p>
              <p className="text-xs text-gray-400">#{train?.TrainNo || train?.number}</p>
            </div>
            <span className="text-xs font-medium px-3 py-1 rounded-full"
              style={{ background: st.bg, color: st.text }}>
              {booking.status === "WAITING" ? `WL/${booking.waitingNumber}` : st.label}
            </span>
          </div>

          {/* PNR */}
          <div className="px-5 py-4 border-b border-gray-50" style={{ background: "#E6F1FB" }}>
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: "#185FA5" }}>PNR Number</p>
            <p className="text-2xl font-medium tracking-widest" style={{ color: "#0C447C" }}>
              {booking.pnr}
            </p>
          </div>

          {/* Route */}
          <div className="px-5 py-4 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-medium text-gray-800">{train?.departTime || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{search?.from}</p>
                <p className="text-xs text-gray-400">{search?.date}</p>
              </div>
              <div className="flex flex-col items-center gap-1 flex-1 mx-4">
                <p className="text-xs text-gray-400">{train?.duration || "—"}</p>
                <div className="w-full h-px bg-gray-200" />
              </div>
              <div className="text-right">
                <p className="text-xl font-medium text-gray-800">{train?.arrivalTime || "—"}</p>
                <p className="text-xs text-gray-400 mt-0.5">{search?.to}</p>
              </div>
            </div>
          </div>

          {/* Seat info */}
          {booking.status === "CONFIRMED" && booking.seatInfo && (
            <div className="px-5 py-3 border-b border-gray-50">
              <p className="text-xs text-gray-400 mb-1">Coach / Berth</p>
              <p className="text-sm font-medium text-gray-800">{booking.seatInfo}</p>
            </div>
          )}

          {/* Passengers */}
          <div className="px-5 py-4 border-b border-gray-50">
            <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-3">Passengers</p>
            {booking.passengers?.map((p, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-gray-50 last:border-b-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.age} yrs · {p.gender}</p>
                </div>
                <p className="text-xs text-gray-500 self-center">{p.berth}</p>
              </div>
            ))}
          </div>

          {/* Fare */}
          <div className="px-5 py-3">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Total paid</p>
              <p className="text-sm font-medium text-gray-800">₹{booking.fare?.toLocaleString("en-IN")}</p>
            </div>
          </div>

          {/* Waiting notice */}
          {booking.status === "WAITING" && (
            <div className="mx-4 mb-4 px-4 py-3 rounded-xl" style={{ background: "#FAEEDA" }}>
              <p className="text-xs font-medium" style={{ color: "#633806" }}>
                Your booking is on the waiting list (WL/{booking.waitingNumber}). You'll receive a confirmation
                SMS/email if your ticket gets confirmed before departure.
              </p>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <button onClick={downloadPDF}
          className="w-full py-3.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2 mb-2.5"
          style={{ background: "#185FA5" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF ticket
        </button>

        <button
          onClick={() => navigate("/pnr-status", { state: { pnr: booking.pnr } })}
          className="w-full py-3.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 flex items-center justify-center gap-2 mb-2.5 bg-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Check PNR status
        </button>

        <button onClick={() => navigate("/dashboard")}
          className="w-full py-3 rounded-xl text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Back to dashboard
        </button>
      </div>
    </motion.div>
  );
};

export default BookingConfirmation;
