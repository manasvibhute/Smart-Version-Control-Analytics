import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CommitsPerDayChart = ({ data }) => {
  const safeData = Array.isArray(data) ? data : [];

  if (safeData.length === 0) {
    return <p className="text-gray-400">No commit data available</p>;
  }

  const maxCommits = Math.max(...safeData.map((d) => d.count), 0) * 1.2;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={safeData} margin={{ top: 20, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid stroke="#9CA3AF" strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#fff" }} />
          <YAxis domain={[0, maxCommits]} tick={{ fontSize: 12, fill: "#fff" }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#1F2937", borderRadius: "8px", border: "none" }}
            itemStyle={{ color: "#fff" }}
            formatter={(value) => [`${value}`, "Commits"]}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#06B6D4"
            strokeWidth={3}
            dot={{ r: 4, stroke: "#1F2937", strokeWidth: 1, fill: "#06B6D4" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitsPerDayChart;
