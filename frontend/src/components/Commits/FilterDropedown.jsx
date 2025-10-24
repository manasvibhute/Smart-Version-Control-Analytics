import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

const FilterDropdown = ({ label, options = [], value, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center space-x-1 px-4 py-2 bg-gray-900 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-700 transition duration-150 border border-gray-700"
      >
        <span>{value || label}</span>
        <FaChevronDown className="w-4 h-4 ml-1 opacity-70" />
      </button>

      {open && (
        <ul className="absolute z-10 mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-lg text-sm text-white max-h-60 overflow-y-auto">
          {options.map((opt, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FilterDropdown;