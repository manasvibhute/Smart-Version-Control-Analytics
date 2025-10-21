import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCodeBranch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaCopy,
  FaDatabase,
  FaWrench,
  FaFilter,
} from "react-icons/fa";

import DashboardNavbar from "../components/DashboardNavbar";
import FilterTabs from "../components/alerts/FilterTabs";
import AlertCard from "../components/alerts/AlertCard";
import AlertSummary from "../components/alerts/AlertSummary";
import { useRepo } from "../context/RepoContext"; // ✅ import context

// --- DATA ---
const ALL_ALERTS = [
  {
    id: 1,
    category: "Merge",
    severity: "High",
    title: "Potential merge conflict detected",
    details: "Changes in auth.service.ts conflict with PR #234",
    time: "30 minutes ago",
    reviewed: false,
    icon: FaCodeBranch,
  },
  {
    id: 2,
    category: "Risk",
    severity: "High",
    title: "High-risk commit requires review",
    details: "Commit d8e91a modified 8 critical files",
    time: "5 hours ago",
    reviewed: false,
    icon: FaExclamationTriangle,
  },
  {
    id: 3,
    category: "Duplicate",
    severity: "Medium",
    title: "Similar bug pattern detected",
    details:
      "Marcus Kim introduced similar issue in commit a7f3b2c last week",
    time: "6 hours ago",
    reviewed: false,
    icon: FaCopy,
  },
  {
    id: 4,
    category: "Productivity",
    severity: "Low",
    title: "Unusual commit frequency",
    details: "15 commits pushed in 1 hour - possible debugging session",
    time: "8 hours ago",
    reviewed: false,
    icon: FaWrench,
  },
  {
    id: 5,
    category: "Risk",
    severity: "High",
    title: "Database schema change without migration",
    details: "Changes to user.model.ts detected without migration file",
    time: "1 day ago",
    reviewed: true,
    icon: FaDatabase,
  },
  {
    id: 6,
    category: "Merge",
    severity: "Medium",
    title: "Branch divergence warning",
    details: "feature/payments is 45 commits behind main",
    time: "1 day ago",
    reviewed: false,
    icon: FaCodeBranch,
  },
  {
    id: 7,
    category: "Productivity",
    severity: "Medium",
    title: "Low test coverage in new module",
    details: "payment.service.ts has only 34% test coverage",
    time: "2 days ago",
    reviewed: true,
    icon: FaCheckCircle,
  },
  {
    id: 8,
    category: "Duplicate",
    severity: "Low",
    title: "Code duplication detected",
    details: "Similar logic found in auth.ts and login.ts",
    time: "3 days ago",
    reviewed: false,
    icon: FaCopy,
  },
];

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
  const [alerts, setAlerts] = useState(ALL_ALERTS);
  const [filter, setFilter] = useState("All");
  const [hideReviewed, setHideReviewed] = useState(false);
  const { selectedRepo } = useRepo(); // ✅ access selected repo
  const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true }); // redirect if not logged in
    }
  }, [token, navigate]);

  const handleMarkAsReviewed = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a))
    );
  };
  
  const filtered = alerts
    .filter((a) => filter === "All" || a.category === filter)
    .filter((a) => !hideReviewed || !a.reviewed);

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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            Alerts & Predictions for <span className="text-cyan-400">{selectedRepo.full_name}</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Monitor predicted conflicts and system warnings
          </p>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((a) => (
            <AlertCard
              key={a.id}
              alert={a}
              onMarkAsReviewed={handleMarkAsReviewed}
            />
          ))}
          {filtered.length === 0 && (
            <div className="lg:col-span-2 text-center py-10 text-gray-500">
              No alerts match the current filter criteria.
            </div>
          )}
        </div>
      </main>

      <AlertSummary alerts={alerts} />
    </div>
  );
};

export default Alerts;
