import React, { useState } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // import navigate
import FilterDropdown from "../components/Commits/FilterDropedown";
import DashboardNavbar from "../components/DashboardNavbar";
import CommitRiskTable from "../components/Commits/CommitRiskTable";
import { RECENT_COMMITS } from "../data/mockData";
import { useRepo } from "../context/RepoContext";
import axios from "axios";
import { useEffect } from "react";
// Main Commits Component
const Commits = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");
  const { selectedRepo } = useRepo();
  const [searchQuery, setSearchQuery] = useState("");
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Explore Commits</h1>
            <p className="text-gray-400 text-lg">Detailed commit history with ML-powered risk assessment</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition duration-150 flex items-center space-x-1 border border-gray-600">
            <FaFilter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="flex justify-between items-center space-x-4 mb-4">
          <div className="relative flex-grow max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search commits..."
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex space-x-3">
            <FilterDropdown label="All Authors" />
            <FilterDropdown label="All BraFnches" />
            <FilterDropdown label="Last 24 hours" />
          </div>
        </div>

        {loading && <p className="text-gray-400">Loading commits...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Commit Risk Table */}
        <CommitRiskTable commits={commits} />
      </main>
    </div>
  );
};

export default Commits;