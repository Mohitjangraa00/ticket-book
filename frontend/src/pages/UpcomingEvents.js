const UpcomingEvents = () => {
  return (
    <div className="p-6 ml-64">
      <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>

      <div className="bg-white p-4 rounded shadow flex items-center">
        <img
          src="https://via.placeholder.com/100"
          alt="event"
          className="rounded"
        />
        <div className="ml-4">
          <h3 className="font-bold">Live Cricket Match</h3>
          <p>25 Jan 2026 | Delhi Stadium</p>
          <button className="mt-2 px-4 py-1 bg-blue-500 text-white rounded">
            Book Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingEvents;
