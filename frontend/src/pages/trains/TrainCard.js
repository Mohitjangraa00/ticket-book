import { useNavigate } from "react-router-dom";

const TrainCard = ({ train }) => {
  const navigate = useNavigate();

  return (
    <div className="card p-6 flex flex-col md:flex-row justify-between gap-4">
      <div>
        <h3 className="text-lg font-semibold">{train.name}</h3>
        <p className="text-sm text-gray-500">Train No: {train.number}</p>

        <div className="flex gap-6 mt-2 text-sm">
          <span>{train.depart}</span>
          <span>→</span>
          <span>{train.arrive}</span>
        </div>

        <p className="text-sm text-gray-500 mt-1">
          Duration: {train.duration}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xl font-bold text-blue-600">
          ₹{train.price}
        </p>
        <button
          onClick={() => navigate("/trains/details")}
          className="btn-primary mt-3"
        >
          View Seats
        </button>
      </div>
    </div>
  );
};

export default TrainCard;
