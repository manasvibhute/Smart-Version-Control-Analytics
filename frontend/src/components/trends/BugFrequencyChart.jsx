// BugFrequencyChart.jsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }, // hide default legend
    tooltip: { mode: "index", intersect: false },
  },
  scales: {
    x: { ticks: { color: "white" }, grid: { color: "rgba(255,255,255,0.1)" } },
    y: {
      beginAtZero: true,
      ticks: {
        color: "white",
        stepSize: 1,
        precision: 0,
        callback: function (value) {
          return Number.isInteger(value) ? value : "";
        },
      },
      grid: { color: "rgba(255,255,255,0.1)" },
    },
  },
};

export default function BugFrequencyChart({ data }) {
  if (
    !data ||
    !Array.isArray(data.labels) ||
    data.labels.length === 0 ||
    !data.datasets ||
    data.datasets.every(ds => !Array.isArray(ds.data) || ds.data.every(val => val === 0))
  ) {
    return <p className="text-gray-400">No bug frequency data available</p>;
  }

  return (
    <div className="glass-card p-1 rounded-xl w-full h-80 flex flex-col">
      <div className="flex-1">
        <Line data={data} options={options} />
      </div>

      {/* Custom Legend */}
      <div className="flex justify-center mt-2 space-x-6">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-red-500 opacity-80"></span>
          <span className="text-white text-sm">Bugs Reported</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-green-500 opacity-80"></span>
          <span className="text-white text-sm">Bugs Fixed</span>
        </div>
      </div>
    </div>
  );
}
