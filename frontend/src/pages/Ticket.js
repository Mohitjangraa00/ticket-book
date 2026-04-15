const Ticket = () => {
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Your Ticket</h2>

      <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=BK12345"
        alt="QR Code"
        className="mx-auto mb-4"
      />

      <p><b>Event:</b> Music Concert</p>
      <p><b>Date:</b> 20 Jan 2026</p>
      <p><b>Seat:</b> A12</p>

      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded">
        Download / Print
      </button>
    </div>
  );
};

export default Ticket;
