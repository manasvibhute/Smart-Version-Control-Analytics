import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import TopRiskyFilesList from "../components/RiskyModules/TopRiskyFilesList";
import RiskHeatmap from "../components/RiskyModules/RiskHeatMap";
import { useNavigate } from "react-router-dom"; // added
import { useRepo } from "../context/RepoContext";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

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
  const [error, setError] = useState("");
  const [riskyFiles, setRiskyFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true }); // redirect if not logged in
    }
  }, [token, navigate]);

  useEffect(() => {
    axios.get(`${API}/risky-modules`, {
      params: { accessToken: token, repo: selectedRepo.full_name }
    })
      .then(res => {
        console.log("Risky files response:", res.data);
        setRiskyFiles(res.data.riskyFiles || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Risky modules error:", err);
        setLoading(false); // ✅ add this too
      });
  }, [token, selectedRepo]);

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
        </div>
        {!loading && riskyFiles.length === 0 && (
          <p className="text-yellow-400 text-sm mt-4">
            No risky modules detected for this repository.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RiskHeatmap modules={riskyFiles} />

          </div>
          <div className="lg:col-span-1">
            <TopRiskyFilesList files={riskyFiles} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskyModules;
