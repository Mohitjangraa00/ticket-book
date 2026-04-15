const FlightCard = ({ flight }) => {
  return (
    <div className="bg-white rounded-xl shadow p-5 flex justify-between items-center">
      <div>
        <h4 className="font-semibold text-lg">{flight.airline}</h4>
        <p className="text-sm text-gray-500">
          {flight.depart} → {flight.arrive}
        </p>
        <p className="text-sm">{flight.duration}</p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold">₹{flight.price}</p>
        <PricePredictor
  from={search.from}
  to={search.to}
  date={search.date}
  type="flight"
  currentPrice={flight.fare}
/>
        <button className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
          Select
        </button>
      </div>
    </div>
  );
};

export default FlightCard;
