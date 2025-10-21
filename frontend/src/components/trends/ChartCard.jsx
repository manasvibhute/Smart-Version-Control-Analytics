import React from "react";

const ChartCard = ({ title, subtitle, children, heightClass = "h-64" }) => (
  <div className="bg-gray-900 p-6 border border-gray-700/50 rounded-xl shadow-xl">
    <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-gray-400 mb-4">{subtitle}</p>}
    <div className={`w-full ${heightClass}`}>{children}</div>
  </div>
);

export default ChartCard;
