import React from "react";
import { FaUser, FaClock, FaCodeBranch } from "react-icons/fa";

const CommitRiskTable = ({ commits }) => {
  const safeCommits = Array.isArray(commits) ? commits : [];

  const getRiskClass = (risk) => {
    switch (risk) {
      case "High":
        return "text-red-400 bg-red-900/40 border-red-800";
      case "Medium":
        return "text-yellow-400 bg-yellow-900/40 border-yellow-800";
      case "Low":
        return "text-green-400 bg-green-900/40 border-green-800";
      default:
        return "text-gray-400 bg-gray-700/40 border-gray-600";
    }
  };

  return (
    <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl shadow-xl overflow-hidden mt-6">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-900/80">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Commit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-3/12">Message</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-2/12">Author</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Files</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-2/12">Changes</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Risk</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/12">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {safeCommits.length === 0 ? (
            <tr>
              <td
                colSpan={7}
                className="px-6 py-4 text-center text-sm text-gray-400"
              >
                No commits available
              </td>
            </tr>
          ) : (
            safeCommits.map((commit, index) => {
              const [added, deleted] = (commit.changes ?? "0/0").split("/");
              return (
                <tr
                  key={index}
                  className="hover:bg-gray-700/30 transition duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-cyan-400">
                    {commit.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{commit.message}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-semibold uppercase">
                        {(commit.author?.name || "")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="text-sm font-medium text-white">
                        {commit.author?.name || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 text-center">
                    {commit.files}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                    <span className="text-green-400 mr-2">{added}</span>
                    <span className="text-red-400">{deleted}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskClass(
                        commit.risk
                      )}`}
                    >
                      {commit.risk}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {commit.time}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};
export default CommitRiskTable;
