const TrainTicket = () => {
  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="section-title text-green-600">
        Booking Confirmed 🎉
      </h1>

      <div className="card p-6 space-y-3">
        <p><b>PNR:</b> 8923456712</p>
        <p><b>Seat:</b> S1 / 23</p>
        <p><b>Status:</b> Confirmed</p>

        <button className="btn-primary w-full mt-4">
          Download Ticket
        </button>
      </div>
    </div>
  );
};

export default TrainTicket;
