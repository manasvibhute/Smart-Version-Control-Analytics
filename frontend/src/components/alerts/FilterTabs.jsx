import React from "react";

const FilterTabs = ({ categories, currentFilter, onFilterChange }) => (
  <div className="flex flex-wrap space-x-2 border-b border-gray-700/50 pb-2 mb-8">
    {categories.map((cat) => (
      <button
        key={cat.label}
        onClick={() => onFilterChange(cat.label)}
        className={`px-4 py-2 text-sm font-medium rounded-full transition duration-150 flex items-center space-x-1 ${
          currentFilter === cat.label
            ? "bg-cyan-600 text-white"
            : "bg-gray-800/70 text-gray-300 hover:bg-gray-600"
        }`}
      >
        <span>{cat.label}</span>
        <span className="text-xs opacity-70">{cat.count}</span>
      </button>
    ))}
  </div>
);

export default FilterTabs;
