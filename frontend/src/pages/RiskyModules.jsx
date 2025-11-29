import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import TopRiskyFilesList from "../components/RiskyModules/TopRiskyFilesList";
import RiskHeatmap from "../components/RiskyModules/RiskHeatMap";
import { useNavigate } from "react-router-dom"; // added
import { useRepo } from "../context/RepoContext";
import axios from "axios";
import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_BASE_URL;

const RiskyModules = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");
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
  const [commits, setCommits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const riskyFiles = {};

  commits.forEach((commit) => {
    commit.files?.forEach((file) => {
      riskyFiles[file.filename] = (riskyFiles[file.filename] || 0) + 1;
    });
  });

  const topFiles = Object.entries(riskyFiles || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([filename, count]) => ({
      filename,
      commits: count,
      risk: Math.min(100, count * 10), // basic risk score
      authors: [], // placeholder for future enhancement
      modified: "recently", // placeholder
    }));

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
        .get(`${API}/github/commits`, {
          params: { repo: selectedRepo.full_name },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setCommits(res.data.commits);
        })
        .catch((err) => {
          setError("Failed to load commits");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Risky Modules</h1>
          <p className="text-gray-400 text-lg">
            Identify bug-prone files and modules in your repository
          </p>
        </div>

        <div className="mb-6">
          {loading && <p className="text-gray-400">Loading risky files...</p>}
          {error && <p className="text-red-500">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RiskHeatmap modules={topFiles} />
          </div>
          <div className="lg:col-span-1">
            <TopRiskyFilesList files={topFiles} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskyModules;
