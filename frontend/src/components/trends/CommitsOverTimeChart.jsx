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
  if (!data || data.length === 0) {
    return <p className="text-gray-400">No commit data available</p>;
  }
  console.log("CommitsOverTimeChart mounted");
  // ✅ Defensive check to prevent Recharts crash
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-400">No commit trend data available</p>;
  }

  const uniqueAuthors = data[0]
    ? Object.keys(data[0]).filter((key) => key !== "date")
    : [];
  console.log("Unique authors for chart:", uniqueAuthors);
  const palette = ["#00cc66", "#ffcc00", "#ff6666", "#9966ff", "#66ccff", "#ff99cc"];
  const colors = Object.fromEntries(uniqueAuthors.map((name, i) => [name, palette[i % palette.length]]));

  return (
    <div className="w-full h-96 bg-gray-900 p-4 rounded-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1f2937", borderRadius: "8px", border: "none" }}
            formatter={(value, name) => [`${value}`, `${name}`]} // ensures name is shown correctly
          />
          <Legend wrapperStyle={{ color: "#ccc" }} />
          {Object.keys(colors).map((name) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              name={name || "Unnamed"} // fallback label
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