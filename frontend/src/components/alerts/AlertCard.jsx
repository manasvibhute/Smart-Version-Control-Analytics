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

const AlertCard = ({ alert, onMarkAsReviewed, repoFullName }) => {
  const Icon = iconMap[alert.category] || FaExclamationTriangle;
  const riskPct = alert.prediction ? (alert.prediction.riskScore * 100).toFixed(1) : null;
  const topFiles = alert.prediction?.riskyFiles?.length
    ? alert.prediction.riskyFiles.map(r => r.filename)
    : alert.prediction?.impactedFiles?.slice(0, 3) || [];

  return (
    <div
      className={`flex flex-col p-6 border border-gray-700/50 rounded-xl shadow-xl transition duration-150 relative ${alert.reviewed ? "bg-gray-900 opacity-80" : "bg-gray-900/80 hover:border-cyan-500"
        }`}
    >
      {alert.reviewed && (
        <div className="absolute top-2 left-2 text-green-500 bg-green-900/50 rounded-full p-0.5">
          <FaCheckCircle className="w-5 h-5" />
        </div>
      )}

      <p className={`text-sm mb-2 ${alert.reviewed ? "text-gray-500" : "text-gray-200"}`}>
        {alert.title || "Untitled Alert"}
      </p>

      {alert.prediction && (
        <div className="text-sm text-cyan-400 mt-2 space-y-1">
          <p><strong>Why this alert?</strong> {alert.prediction.explanation || "No explanation provided."}</p>
          <p className="text-gray-400 text-xs">
            Risk Score: {typeof alert.prediction?.riskScore === "number" ? (alert.prediction.riskScore * 100).toFixed(1) : "N/A"}%
            Confidence: {typeof alert.prediction?.confidence === "number" ? (alert.prediction.confidence * 100).toFixed(1) : "N/A"}%
          </p>
          {/* Highlight top risky files */}
          {topFiles.length > 0 && (
            <div className="text-xs">
              <span className="text-gray-400">Focus files:</span>
              <ul className="mt-1 space-y-1">
                {topFiles.map((f) => (
                  <li key={f} className="inline-block mr-2 mb-1 px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-200">
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-gray-500 text-xs">
            Impacted Files: {alert.prediction.impactedFiles?.length > 0 ? alert.prediction.impactedFiles.join(", ") : "None"}
          </p>
          <p className="text-gray-600 text-xs italic">
            Model: {alert.prediction.model} | Features: {alert.prediction.features?.join(", ") || "N/A"}
          </p>
        </div>
      )}

      {/* Suggested Action */}
      {riskPct && (
        <div className="mt-3 text-sm text-yellow-400">
          <strong>Suggested action:</strong>{" "}
          {riskPct >= 60
            ? "Run regression tests on dashboard components and review high-churn files."
            : "Review the diff and test the affected UI flow (Navbar, Alerts, Dashboard)."}
        </div>
      )}

      {/* View commit button */}
      <div className="mt-3">
        {alert.sha && repoFullName && (
          <a
            href={`https://github.com/${repoFullName}/commit/${alert.sha}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block px-3 py-1 text-sm font-medium text-white bg-gray-900/90 border border-gray-500/50 rounded-lg hover:bg-cyan-600 transition duration-200"
          >
            View Commit Diff
          </a>
        )}
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto pt-4">
        <span>{alert.time || "Unknown time"}</span>
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