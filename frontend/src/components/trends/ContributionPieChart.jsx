import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ContributionPieChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-gray-400">No contribution data available</p>;
  }

  const pieData = Object.entries(data).map(([name, value]) => ({ name, value }));

  const palette = ["#00cc66", "#ffcc00", "#ff6666", "#9966ff", "#66ccff", "#ff99cc"];
  const colors = Object.fromEntries(pieData.map((entry, i) => [entry.name, palette[i % palette.length]]));

  return (
    <div className="w-96 h-96 bg-gray-900 p-4 rounded-lg flex items-center justify-center">
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[entry.name]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "8px", color: "#fff" }} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ color: "#ccc", fontSize: "0.875rem" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ContributionPieChart;
