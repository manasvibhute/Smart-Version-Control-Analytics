import React, { useState } from "react";

const RiskHeatmap = ({ modules }) => {
  const [hoveredModule, setHoveredModule] = useState(null);

  return (
    <div className="grid grid-cols-5 gap-2">
      {modules.map((module, index) => {
        // ✅ Cap risk at 60
        const cappedRisk = Math.min(60, module.risk ?? 50);

        // ✅ Only green and yellow (no red)
        const color = cappedRisk >= 50 ? "bg-yellow-600" : "bg-green-600";

        return (
          <div
            key={index}
            className={`${color} aspect-square rounded-md flex items-center justify-center text-xs font-semibold text-white cursor-pointer relative hover:border-white border-2 border-transparent p-2 text-center`}
            onMouseEnter={() => setHoveredModule(module)}
            onMouseLeave={() => setHoveredModule(null)}
          >
            <div className="whitespace-normal break-all leading-tight max-w-[95%] overflow-hidden text-ellipsis line-clamp-2">
              {module.filename}
            </div>

            {/* ✅ Tooltip */}
            {hoveredModule?.filename === module.filename && (
              <div className="absolute z-10 -top-8 bg-gray-700 text-white text-xs px-2 py-1 rounded-md shadow-lg whitespace-nowrap">
                {module.bugFixes} risky commits
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RiskHeatmap;