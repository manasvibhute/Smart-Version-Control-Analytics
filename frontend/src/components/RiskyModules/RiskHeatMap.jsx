import React, { useState } from "react";
import { RISK_MODULES } from "../../data/mockData";

const RiskHeatmap = () => {
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <div className="bg-gray-900/70 p-6 border border-gray-700/50 rounded-xl shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Risk Heatmap</h3>

      {/* Severity legend */}
      <div className="flex justify-end space-x-3 text-sm text-gray-400 mb-4">
        <span className="flex items-center">
          <span className="w-3 h-3 bg-red-600 rounded-full mr-1"></span>High
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 bg-yellow-600 rounded-full mr-1"></span>Medium
        </span>
        <span className="flex items-center">
          <span className="w-3 h-3 bg-green-600 rounded-full mr-1"></span>Low
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-4 gap-2">
        {RISK_MODULES.map((module, index) => (
          <div
            key={index}
            className={`${module.color} w-full aspect-square rounded-md flex items-center justify-center text-xs font-semibold text-white cursor-pointer relative hover:border-white border-2 border-transparent`}
            onMouseEnter={() => setHoveredModule(module)}
            onMouseLeave={() => setHoveredModule(null)}
          >
            {module.name}
            {hoveredModule && hoveredModule.name === module.name && (
              <div className="absolute z-10 -top-8 bg-gray-700 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                {module.tooltip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskHeatmap;
