import React from "react";
import {
  FaCheckCircle,
  FaCodeBranch,
  FaExclamationTriangle,
  FaCopy,
  FaWrench,
} from "react-icons/fa";

const iconMap = {
  Merge: FaCodeBranch,
  Risk: FaExclamationTriangle,
  Productivity: FaWrench,
  Duplicate: FaCopy,
  Reviewed: FaCheckCircle,
};

const AlertCard = ({ alert, onMarkAsReviewed }) => {
  const Icon = iconMap[alert.category] || FaExclamationTriangle;

  return (
    <div
      className={`flex flex-col p-6 border border-gray-700/50 rounded-xl shadow-xl transition duration-150 relative ${
        alert.reviewed ? "bg-gray-900 opacity-80" : "bg-gray-900/80 hover:border-cyan-500"
      }`}
    >
      {alert.reviewed && (
        <div className="absolute top-2 left-2 text-green-500 bg-green-900/50 rounded-full p-0.5">
          <FaCheckCircle className="w-5 h-5" />
        </div>
      )}

      <p className={`text-sm mb-4 ${alert.reviewed ? "text-gray-500" : "text-gray-400"}`}>
        {alert.details}
      </p>

      {alert.prediction && (
        <div className="text-sm text-cyan-400 mt-2 space-y-1">
          <p><strong>Why this alert?</strong> {alert.prediction.explanation}</p>
          <p className="text-gray-400 text-xs">
            Risk Score: {(alert.prediction.riskScore * 100).toFixed(1)}% | Confidence: {(alert.prediction.confidence * 100).toFixed(1)}%
          </p>
          <p className="text-gray-500 text-xs">
            Impacted Files: {alert.prediction.impactedFiles.join(", ")}
          </p>
          <p className="text-gray-600 text-xs italic">
            Model: {alert.prediction.model} | Features: {alert.prediction.features.join(", ")}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-4">
        <span>{alert.time}</span>
        {alert.reviewed ? (
          <span className="flex items-center text-green-500">
            <FaCheckCircle className="w-4 h-4 mr-1" /> Reviewed
          </span>
        ) : (
          <button
            onClick={() => onMarkAsReviewed(alert.id)}
            className="px-3 py-1 text-sm font-medium text-white bg-gray-900/90 border border-gray-500/50 rounded-lg hover:bg-cyan-600 transition duration-200"
          >
            Mark as Reviewed
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertCard;