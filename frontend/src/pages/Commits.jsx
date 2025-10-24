import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import FilterDropdown from "../components/Commits/FilterDropedown";
import DashboardNavbar from "../components/DashboardNavbar";
import CommitRiskTable from "../components/Commits/CommitRiskTable";
import { useRepo } from "../context/RepoContext";
import axios from "axios";

const Commits = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");
  const { selectedRepo } = useRepo();

  const [searchQuery, setSearchQuery] = useState("");
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedTime, setSelectedTime] = useState("All Time");

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState("All Risks");
  const [selectedSize, setSelectedSize] = useState("All Sizes");

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (selectedRepo) {
      setLoading(true);
      axios
        .get("http://localhost:5000/github/commits", {
          params: { repo: selectedRepo.full_name },
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          const transformed = res.data.commits.map((c) => ({
            id: c.sha.slice(0, 7),
            message: c.commit.message,
            author: { name: c.commit.author?.name || "Unknown" },
            files: Array.isArray(c.files) ? c.files.length : 0,
            changes: c.stats
              ? `${c.stats.additions}/${c.stats.deletions}`
              : "0/0",
            risk: /crash|security|vulnerability|exploit/i.test(c.commit.message)
              ? "High"
              : /fix|bug|hotfix/i.test(c.commit.message)
              ? "Medium"
              : "Low",
            time: new Date(c.commit.author.date).toLocaleString(),
            branch: c.branch || "main",
          }));
          setCommits(transformed);
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

        {loading && <p className="text-gray-400">Loading commits...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* Commit Risk Table */}
        <CommitRiskTable commits={filteredCommits} />
      </main>
    </div>
  );
};

export default Commits;