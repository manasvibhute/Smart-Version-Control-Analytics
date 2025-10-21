import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CommitsOverTimeChart = ({ data }) => {
  // ✅ Defensive check to prevent Recharts crash
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-400">No commit trend data available</p>;
  }

  const uniqueAuthors = [...new Set(data.map((d) => d.author))];
  const palette = ["#00cc66", "#ffcc00", "#ff6666", "#9966ff", "#66ccff", "#ff99cc"];
  const colors = Object.fromEntries(uniqueAuthors.map((name, i) => [name, palette[i % palette.length]]));

  return (
    <div className="w-full h-96 bg-gray-900 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="month" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }} />
          <Legend wrapperStyle={{ color: "#ccc" }} />
          {Object.keys(colors).map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={colors[name]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CommitsOverTimeChart;