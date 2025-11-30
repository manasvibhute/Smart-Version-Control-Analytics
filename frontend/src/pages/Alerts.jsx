import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaFilter, FaExclamationTriangle } from "react-icons/fa";

import DashboardNavbar from "../components/DashboardNavbar";
import FilterTabs from "../components/alerts/FilterTabs";
import AlertCard from "../components/alerts/AlertCard";
import AlertSummary from "../components/alerts/AlertSummary";
import { useRepo } from "../context/RepoContext";

const API = import.meta.env.VITE_API_BASE_URL;

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
  // 🚫 If no repo is selected, block this page
  if (!selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">No Repository Selected</h1>
        <p className="text-gray-400">Please connect a repository to view analytics.</p>
      </div>
    );
  }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const MIN_RISK_THRESHOLD = 0.4;

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !selectedRepo) return;

    setLoading(true);

    axios
      .get(`${API}/alerts`, {
        params: {
          accessToken: token,
          repo: selectedRepo.full_name,
        },
      })
      .then((res) => setAlerts(res.data.alerts || []))
      .catch((err) => {
        console.error("Failed to fetch alerts:", err.response?.data || err.message);
        setError("Could not load alerts");
      })
      .finally(() => setLoading(false));
  }, [token, selectedRepo]);

  const handleMarkAsReviewed = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a))
    );
  };

  const filtered = alerts.filter((a) => {
    const score = Number(a.prediction?.riskScore);

    const passesRisk =
      isNaN(score) || score >= MIN_RISK_THRESHOLD; // FIXED

    const passesReview = !hideReviewed || !a.reviewed;

    const matchesCategory =
      filter === "All" ||
      a.category?.toLowerCase() === filter.toLowerCase(); // FIXED

    return passesRisk && passesReview && matchesCategory;
  });

  const dynamicCategories = ALERT_CATEGORIES.map((cat) => {
    const filteredAlerts = alerts.filter((a) => {
      const score = Number(a.prediction?.riskScore);

      const passesRisk =
        isNaN(score) || score >= MIN_RISK_THRESHOLD;

      const passesReview = !hideReviewed || !a.reviewed;

      const matchesCategory =
        cat.label === "All" ||
        a.category?.toLowerCase() === cat.label.toLowerCase();

      return passesRisk && passesReview && matchesCategory;
    });

    return { ...cat, count: filteredAlerts.length };
  });

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

      <main className="pt-24 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <p className="text-sm text-gray-400 -mt-10 mb-4 italic">
          Showing alerts with predicted risk ≥ 40%.
        </p>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-10">Loading alerts...</div>
        ) : (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filtered.map((a) => (
              <AlertCard
                key={a.id}
                alert={a}
                repoFullName={selectedRepo.full_name}
                onMarkAsReviewed={handleMarkAsReviewed}
              />
            ))}
            {filtered.length === 0 && (
              <div className="lg:col-span-2 text-center py-10 text-gray-500">
                <FaExclamationTriangle className="mx-auto mb-2 w-6 h-6 text-yellow-500" />
                No alerts match the current filter criteria.
              </div>
            )}
            {filtered.length === 0 && alerts.length > 0 && (
              <div className="lg:col-span-2 text-center py-4 text-yellow-400 text-sm">
                All alerts are currently hidden due to filters. Try changing your category or showing reviewed alerts.
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