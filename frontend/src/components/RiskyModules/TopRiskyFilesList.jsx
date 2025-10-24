import React from "react";
import { FaUser, FaClock, FaCodeBranch } from "react-icons/fa";

const TopRiskyFilesList = ({ files, stats }) => {
  const RiskItem = ({ file }) => {
    const riskColor =
      file.risk > 80
        ? "bg-red-500"
        : file.risk > 60
          ? "bg-yellow-400"
          : "bg-green-400";

    return (
      <div className="p-4 border-b border-gray-700/50 last:border-b-0 hover:bg-gray-700/30 transition duration-150 rounded-lg">
        {/* File Info */}
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-medium text-white truncate pr-2">{file.filename}</h4>
          <span className={`text-lg font-bold ${riskColor.replace("bg", "text")}`}>
            {file.risk ?? 50}%
          </span>
        </div>

        {/* File details */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 space-x-4 mt-1">
          <span className="flex items-center space-x-1">
            <FaCodeBranch className="w-3 h-3" />
            <span>{file.commits} risky commits</span>
          </span>
          <span className="flex items-center space-x-1">
            <FaClock className="w-3 h-3" />
            <span>Modified {file.modified ?? "recently"}</span>
          </span>
          <span className="flex items-center space-x-1">
            <FaUser className="w-3 h-3" />
            <span>{file.authors?.join(", ") ?? "Unknown"}</span>
          </span>
        </div>

        {/* Risk Bar */}
        <div className="mt-3 w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className={`${riskColor} h-full`}
            style={{ width: `${file.risk}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900/70 p-6 border border-gray-700/50 rounded-xl shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Top 5 Most Risky Files</h3>

      <div className="divide-y divide-gray-700">
        {(!files || files.length === 0) && (
          <p className="text-gray-400">No risky files found.</p>
        )}
        {files.map((file, idx) => (
          <RiskItem key={idx} file={file} />
        ))}
      </div>

      {stats && (
        <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
          <h4 className="text-sm font-semibold text-white mb-3">Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Total Modules</span>
              <span>{stats.totalModules}</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>High Risk</span>
              <span>{stats.highRisk}</span>
            </div>
            <div className="flex justify-between text-yellow-400">
              <span>Medium Risk</span>
              <span>{stats.mediumRisk}</span>
            </div>
            <div className="flex justify-between text-green-400">
              <span>Low Risk</span>
              <span>{stats.lowRisk}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default TopRiskyFilesList;
