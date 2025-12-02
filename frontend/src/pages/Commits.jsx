import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FilterDropdown from "../components/Commits/FilterDropedown";
import DashboardNavbar from "../components/DashboardNavbar";
import CommitRiskTable from "../components/Commits/CommitRiskTable";
import { useRepo } from "../context/RepoContext";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

const Commits = () => {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedTime, setSelectedTime] = useState("All Time");
  const [page, setPage] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState("All Risks");
  const [selectedSize, setSelectedSize] = useState("All Sizes");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!selectedRepo) return;
    setLoading(true);

    axios.get(`${API}/commits/github`, {
      params: {
        accessToken: token,
        repo: selectedRepo.full_name,
        page,
        per_page: 20
      },
    })
      .then((res) => {
        const transformed = (res.data.commits || []).map((c) => ({
          id: c.sha.slice(0, 7),
          message: c.message,
          author: { name: c.author || "Unknown" },
          files: c.filesCount || 0, // backend now returns filesCount
          changes:
            c.stats && c.stats.additions !== undefined
              ? `${c.stats.additions}/${c.stats.deletions}`
              : "0/0",
          risk: /crash|security|vulnerability|exploit/i.test(c.message)
            ? "High"
            : /fix|bug|hotfix/i.test(c.message)
              ? "Medium"
              : "Low",
          time: new Date(c.date).toLocaleString(),
          branch: c.branch || "main",
        }));
        setCommits(transformed);
      })
      .catch((err) => {
        console.error("Failed to fetch commits:", err.response?.data || err.message);
        setError("Could not load commit history");
      })
      .finally(() => setLoading(false));
  }, [selectedRepo, page]);

  const authors = commits.map((c) => c.author?.name).filter(Boolean);
  const uniqueAuthors = ["All Authors", ...new Set(authors)];

  const branches = commits.map((c) => c.branch).filter(Boolean);
  const uniqueBranches = ["All Branches", ...new Set(branches)];

  const filteredCommits = commits.filter((commit) => {
    const message = commit.message?.toLowerCase() || "";
    const matchesSearch = message.includes(searchQuery.toLowerCase());
    const matchesAuthor = selectedAuthor === "All Authors" || commit.author?.name === selectedAuthor;
    const matchesBranch = selectedBranch === "All Branches" || commit.branch === selectedBranch;

    const commitTime = new Date(commit.time);
    const now = new Date();
    const matchesTime =
      selectedTime === "All Time" ||
      (selectedTime === "Last 24 hours" && commitTime >= new Date(now - 24 * 60 * 60 * 1000)) ||
      (selectedTime === "Last 7 days" && commitTime >= new Date(now - 7 * 24 * 60 * 60 * 1000));

    const matchesRisk = selectedRisk === "All Risks" || commit.risk === selectedRisk;

    const [additions, deletions] = commit.changes.split("/").map(Number);
    const totalChanges = additions + deletions;
    const matchesSize =
      selectedSize === "All Sizes" ||
      (selectedSize === "Small (<10)" && totalChanges < 10) ||
      (selectedSize === "Medium (10–100)" && totalChanges >= 10 && totalChanges <= 100) ||
      (selectedSize === "Large (>100)" && totalChanges > 100);

    return (
      matchesSearch &&
      matchesAuthor &&
      matchesBranch &&
      matchesTime &&
      matchesRisk &&
      matchesSize
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      <DashboardNavbar />

      <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Explore Commits</h1>
            <p className="text-gray-400 text-lg">
              Detailed commit history with ML-powered risk assessment
            </p>
          </div>
          <button
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition duration-150 flex items-center space-x-1 border border-gray-600"
          >
            <FaFilter className="w-4 h-4" />
            <span>Advanced Filters</span>
          </button>
        </div>

        {/* Search & Basic Filters */}
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
            <FilterDropdown
              label="All Authors"
              options={uniqueAuthors}
              value={selectedAuthor}
              onChange={setSelectedAuthor}
            />
            <FilterDropdown
              label="All Branches"
              options={uniqueBranches}
              value={selectedBranch}
              onChange={setSelectedBranch}
            />
            <FilterDropdown
              label="All Time"
              options={["All Time", "Last 24 hours", "Last 7 days"]}
              value={selectedTime}
              onChange={setSelectedTime}
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="flex space-x-3 mb-4">
            <FilterDropdown
              label="All Risks"
              options={["All Risks", "High", "Medium", "Low"]}
              value={selectedRisk}
              onChange={setSelectedRisk}
            />
            <FilterDropdown
              label="All Sizes"
              options={["All Sizes", "Small (<10)", "Medium (10–100)", "Large (>100)"]}
              value={selectedSize}
              onChange={setSelectedSize}
            />
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <>
            <CommitRiskTable commits={filteredCommits} />
            {/* Pagination controls go right after the table */}
            <div className="flex justify-between mt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 bg-gray-700 rounded"
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Commits;