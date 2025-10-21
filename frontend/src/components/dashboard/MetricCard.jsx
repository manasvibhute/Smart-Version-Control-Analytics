import React from "react";

const MetricCard = ({ title, value, unit, trend, status, icon: Icon, iconColor, trendColor }) => (
  <div className="p-4 bg-gray-900 border border-gray-700/50 rounded-xl shadow-xl flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <div className="mt-2 mb-1">
      <span className="text-3xl font-bold text-white">{value}</span>
      <span className="text-xl text-gray-400 ml-1">{unit}</span>
    </div>
    <div className="text-sm">
      <span className={`font-semibold ${trendColor}`}>{trend}</span>
      <span className="text-gray-500 ml-1">vs last week</span>
    </div>
    <p className="text-xs text-gray-500 mt-1">{status}</p>
  </div>
);

export default MetricCard;
