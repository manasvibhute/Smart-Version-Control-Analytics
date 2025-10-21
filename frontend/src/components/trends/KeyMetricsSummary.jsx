import React from "react";

const KeyMetricsSummary = () => {
  const metrics = [
    { title: "Total Contributions", value: "8838", color: "text-white" },
    { title: "Active Contributors", value: "5", color: "text-cyan-400" },
    { title: "Bugs This Month", value: "14", color: "text-red-400" },
    { title: "Bugs Fixed", value: "21", color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-gray-900 p-4 border border-gray-700/50 rounded-xl text-left"
        >
          <div className="text-sm text-gray-400 mb-1">{metric.title}</div>
          <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
        </div>
      ))}
    </div>
  );
};

export default KeyMetricsSummary;
