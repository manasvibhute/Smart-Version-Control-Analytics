import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import AlertTag from "./AlertTag.jsx";

const AlertCard = ({ alert, onMarkAsReviewed }) => {
  const Icon = alert.icon;
  return (
    <div
      className={`flex flex-col p-6 border border-gray-700/50 rounded-xl shadow-xl transition duration-150 relative ${
        alert.reviewed
          ? "bg-gray-900 opacity-80"
          : "bg-gray-900/80 hover:border-cyan-500"
      }`}
    >
      {alert.reviewed && (
        <div className="absolute top-2 left-2 text-green-500 bg-green-900/50 rounded-full p-0.5">
          <FaCheckCircle className="w-5 h-5" />
        </div>
      )}

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <Icon
            className={`w-6 h-6 ${
              alert.reviewed ? "text-gray-500" : "text-cyan-500"
            }`}
          />
          <h3 className="text-lg font-semibold text-white leading-snug">
            {alert.title}
          </h3>
        </div>
        <AlertTag severity={alert.severity} />
      </div>

      <p
        className={`text-sm mb-4 ${
          alert.reviewed ? "text-gray-500" : "text-gray-400"
        }`}
      >
        {alert.details}
      </p>

      <div className="flex justify-between items-center text-xs text-gray-500 mt-auto">
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
