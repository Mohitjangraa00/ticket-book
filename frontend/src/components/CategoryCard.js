import React from "react";

const CategoryCard = ({ title, icon, onClick, bg }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex items-center gap-4"
    >
      <div className={`p-4 rounded-full text-white ${bg}`}>
        {icon}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-800">
          {title}
        </h3>
        <p className="text-sm text-slate-500">
          Book {title.toLowerCase()} tickets
        </p>
      </div>
    </div>
  );
};

export default CategoryCard;
