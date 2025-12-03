import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const RecentAlertsList = ({ alerts }) => {
  const navigate = useNavigate();
  const [reviewedIds, setReviewedIds] = useState([]);

  const handleReview = (id) => {
    setReviewedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Alerts</h2>
        <button
          onClick={() => navigate("/alerts")}
          className="text-cyan-500 text-sm font-medium hover:text-cyan-400 flex items-center"
        >
          View All <FaArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-4">
        {alerts
          .filter(alert => alert && alert.title && alert.details && alert.time)
          .slice(0, 3)
          .map(alert => (
            <div
              key={alert.id}
              className="flex justify-between items-center p-4 bg-gray-900 border border-gray-700/50 rounded-xl hover:border-cyan-500 transition duration-150"
            >
              <div>
                <h4 className="text-base font-semibold text-white">
                  {alert.title}
                  <span
                    className={`text-xs ml-2 px-2 py-0.5 rounded-full ${alert.severity === "High"
                        ? "bg-red-900/40 text-red-400"
                        : alert.severity === "Medium"
                          ? "bg-yellow-900/40 text-yellow-400"
                          : "bg-green-900/40 text-green-400"
                      }`}
                  >
                    {alert.severity}
                  </span>
                </h4>
                <p className="text-sm text-gray-400 mt-0.5">{alert.details}</p>

                {alert.prediction && (
                  <div className="mt-2 text-xs text-gray-400 space-y-1">
                    <p>💡 {alert.prediction.explanation}</p>
                    <p>
                      Risk Score:{" "}
                      {(alert.prediction.riskScore * 100).toFixed(1)}%
                    </p>
                    <p>
                      Impacted Files:{" "}
                      {alert.prediction.impactedFiles?.length > 0
                        ? alert.prediction.impactedFiles.join(", ")
                        : "None"}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
              {reviewedIds.includes(alert.id) ? (
                <span className="text-green-400 text-sm font-medium flex items-center">
                  ✅ Reviewed
                </span>
              ) : (
                <button
                  onClick={() => handleReview(alert.id)}
                  className="px-3 py-1 text-sm font-medium text-white bg-cyan-500 rounded-lg hover:bg-cyan-400 transition duration-200"
                >
                  Review
                </button>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default RecentAlertsList;