import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import MetricCard from "../components/dashboard/MetricCard";
import ChartContainer from "../components/dashboard/ChartContainer";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import RecentAlertsList from "../components/dashboard/RecentAlertsList";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useRepo } from "../context/RepoContext";
import axios from "axios";
import {
  METRICS_DATA,
  COMMITS_PER_DAY_DATA,
  LINES_CHANGED_DATA,
  RECENT_ALERTS,
} from "../data/mockData";

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");
  const { selectedRepo } = useRepo();
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const dailyCounts = {};

  commits.forEach((commit) => {
    const date = new Date(commit.commit.author.date).toISOString().split("T")[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const chartData = Array.isArray(dailyCounts)
    ? dailyCounts
    : Object.entries(dailyCounts || {}).map(([date, count]) => ({ date, count }));

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true }); // redirect if not logged in
    }
  }, [token, navigate]);
  if (!selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white p-6">
        <DashboardNavbar />
        <p className="mt-20 text-center text-gray-400">
          No repository selected. Please go to <strong>/repos</strong> and choose one.
        </p>
      </div>
    );
  }
  useEffect(() => {
    if (selectedRepo) {
      setLoading(true);
      axios
        .get("http://localhost:5000/github/commits", {
          params: { repo: selectedRepo.full_name },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCommits(res.data.commits);
        })
        .catch((err) => {
          console.error("Failed to fetch commits:", err.response?.data || err.message);
          setError("Could not load commit history");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedRepo]);

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      <DashboardNavbar />

      <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {METRICS_DATA.map((metric, i) => (
            <MetricCard key={i} {...metric} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="mb-8">
          <ChartContainer title="Commits Per Day">
            <CommitsPerDayChart data={chartData} />
          </ChartContainer>
        </div>
        {/* Recent Commits */}
        {loading && <p className="text-gray-400">Loading commits...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {commits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Recent Commits</h3>
            <ul className="space-y-2">
              {Array.isArray(commits) && commits.slice(0, 5).map((commit) => (
                <li key={commit.sha} className="text-sm text-gray-300">
                  <strong>{commit.commit.author.name}</strong>: {commit.commit.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Alerts */}
        <RecentAlertsList alerts={RECENT_ALERTS} />
      </main>
    </div>
  );
};

export default Dashboard;
