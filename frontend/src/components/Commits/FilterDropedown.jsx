import React from "react";
import { FaChevronDown } from "react-icons/fa";

const FilterDropdown = ({ label, count }) => (
  <button className="flex items-center space-x-1 px-4 py-2 bg-gray-900 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition duration-150">
    <span>{label}</span>
    {count && <span className="text-xs opacity-70">({count})</span>}
    <FaChevronDown className="w-4 h-4 ml-1 opacity-70" />
  </button>
);

export default FilterDropdown;
