import React from "react";

const BookingCard = ({ icon, title, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center justify-center hover:scale-105"
    >
      <div className="text-4xl text-indigo-600 mb-3">
        {icon}
      </div>
      <h3 className="text-gray-800 font-semibold text-lg">
        {title}
      </h3>
    </div>
  );
};

export default BookingCard;
