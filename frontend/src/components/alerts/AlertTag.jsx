import React from "react";

const AlertTag = ({ severity }) => {
  const colors = {
    High: "text-red-400 bg-red-900/50",
    Medium: "text-yellow-400 bg-yellow-900/50",
    Low: "text-green-400 bg-green-900/50",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full ${
        colors[severity] || "text-gray-400 bg-gray-700/50"
      }`}
    >
      {severity}
    </span>
  );
};

export default AlertTag;
