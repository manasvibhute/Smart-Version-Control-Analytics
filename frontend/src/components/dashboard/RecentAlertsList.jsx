import React from "react";
import { FaArrowRight } from "react-icons/fa";

const RecentAlertsList = ({ alerts }) => (
  <div className="mt-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold text-white">Recent Alerts</h2>
      <button className="text-cyan-500 text-sm font-medium hover:text-cyan-400 flex items-center">
        View All <FaArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
    <div className="space-y-4">
      {alerts.map(alert => (
        <div key={alert.id} className="flex justify-between items-center p-4 bg-gray-900 border border-gray-700/50 rounded-xl hover:border-cyan-500 transition duration-150">
          <div>
            <h4 className="text-base font-semibold text-white">
              {alert.title}
              <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${alert.severity === 'High' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                {alert.severity}
              </span>
            </h4>
            <p className="text-sm text-gray-400 mt-0.5">{alert.details}</p>

            {alert.prediction && (
              <div className="mt-2 text-xs text-gray-400 space-y-1">
                <p>💡 {alert.prediction.explanation}</p>
                <p>Risk Score: {(alert.prediction.riskScore * 100).toFixed(1)}%</p>
                <p>Impacted Files: {alert.prediction.impactedFiles?.length > 0 ? alert.prediction.impactedFiles.join(", ") : "None"}</p>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
          </div>
          <button className="px-3 py-1 text-sm font-medium text-white bg-cyan-500 rounded-lg hover:bg-cyan-500 transition duration-200">
            {alert.action}
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default RecentAlertsList;
