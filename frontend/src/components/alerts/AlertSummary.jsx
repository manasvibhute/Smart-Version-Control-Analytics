import React from "react";

const AlertSummary = ({ alerts }) => {
  // Hotfix: resolving merge conflict in alert summary component
  const total = alerts.length;
  const highRisk = alerts.filter((a) => a.prediction?.riskScore >= 0.4).length;
  const pending = alerts.filter((a) => !a.reviewed).length;
  const reviewed = alerts.filter((a) => a.reviewed).length;

  const summary = [
    { title: "Total Alerts", value: total, color: "text-white" },
    { title: "High Risk Alerts", value: highRisk, color: "text-red-400" },
    { title: "Pending Review", value: pending, color: "text-yellow-400" },
    { title: "Reviewed", value: reviewed, color: "text-green-400" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700/50 shadow-2xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summary.map((s, i) => (
          <div key={i} className="text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-gray-400">{s.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertSummary;

