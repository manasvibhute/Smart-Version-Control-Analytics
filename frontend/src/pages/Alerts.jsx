import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaExclamationTriangle } from "react-icons/fa";

import DashboardNavbar from "../components/DashboardNavbar";
import FilterTabs from "../components/alerts/FilterTabs";
import AlertCard from "../components/alerts/AlertCard";
import AlertSummary from "../components/alerts/AlertSummary";
import { useRepo } from "../context/RepoContext";

const ALERT_CATEGORIES = [
  { label: "All" },
  { label: "Merge" },
  { label: "Risk" },
  { label: "Duplicate" },
  { label: "Productivity" },
];

const Alerts = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState("All");
  const [hideReviewed, setHideReviewed] = useState(false);
  const { selectedRepo } = useRepo();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const MIN_RISK_THRESHOLD = 0.6;

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !selectedRepo) return;

    setLoading(true);
    axios
      .get("http://localhost:5000/github/alerts", {
        params: { repo: selectedRepo.full_name },
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAlerts(res.data.alerts);
      })
      .catch((err) => {
        console.error("Failed to fetch alerts:", err.message);
        setError("Could not load alerts");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token, selectedRepo]);

  const handleMarkAsReviewed = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a))
    );
  };

  const filtered = alerts
    .filter((a) => filter === "All" || a.category === filter)
    .filter((a) => !hideReviewed || !a.reviewed)
    .filter((a) => !a.prediction || a.prediction.riskScore >= MIN_RISK_THRESHOLD);

  const dynamicCategories = ALERT_CATEGORIES.map((cat) => ({
    ...cat,
    count:
      cat.label === "All"
        ? alerts.filter((a) => !hideReviewed || !a.reviewed).length
        : alerts.filter(
            (a) => a.category === cat.label && (!hideReviewed || !a.reviewed)
          ).length,
  }));

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

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      <DashboardNavbar />

      <main className="pt-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Alerts & Predictions for <span className="text-cyan-400">{selectedRepo.full_name}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor predicted conflicts and system warnings
          </p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <FilterTabs
            categories={dynamicCategories}
            currentFilter={filter}
            onFilterChange={setFilter}
          />
          <button
            onClick={() => setHideReviewed(!hideReviewed)}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition duration-150 flex items-center space-x-1"
          >
            <FaFilter className="w-4 h-4" />
            <span>{hideReviewed ? "Show Reviewed" : "Hide Reviewed"}</span>
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Showing alerts with predicted risk ≥ 60%.
        </p>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading alerts...</div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((a) => (
              <AlertCard key={a.id} alert={a} onMarkAsReviewed={handleMarkAsReviewed} />
            ))}
            {filtered.length === 0 && (
              <div className="lg:col-span-2 text-center py-10 text-gray-500">
                <FaExclamationTriangle className="mx-auto mb-2 w-6 h-6 text-yellow-500" />
                No alerts match the current filter criteria.
              </div>
            )}
          </section>
        )}
      </main>

      <AlertSummary alerts={alerts} />
    </div>
  );
};

export default Alerts;