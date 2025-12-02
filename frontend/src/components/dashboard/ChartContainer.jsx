import React from "react";

const ChartContainer = ({ title, children }) => (
  <div className="p-4 bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl min-h-[300px]">
    <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

export default ChartContainer;