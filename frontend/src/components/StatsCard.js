const StatsCard = ({ title, value }) => {
  return (
    <div className="bg-white p-6 rounded shadow text-center">
      <h3 className="text-gray-600">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatsCard;
