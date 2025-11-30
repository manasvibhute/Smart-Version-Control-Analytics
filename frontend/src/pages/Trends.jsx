import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiDownload } from "react-icons/fi";

import DashboardNavbar from "../components/DashboardNavbar";
import ChartCard from "../components/trends/ChartCard";
import CommitsOverTimeChart from "../components/trends/CommitsOverTimeChart";
import LinesAddedDeletedChart from "../components/trends/LinesAddedDeletedChart";
import ContributionPieChart from "../components/trends/ContributionPieChart";
import KeyMetricsSummary from "../components/trends/KeyMetricsSummary";
import { useRepo } from "../context/RepoContext";

const API = import.meta.env.VITE_API_BASE_URL;

const Trends = () => {
  const { selectedRepo } = useRepo();
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");

  const [commits, setCommits] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [linesData, setLinesData] = useState([]);
  const [authorCounts, setAuthorCounts] = useState({});

  // 🚫 If no repo is selected, block this page
  if (!selectedRepo) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-2">No Repository Selected</h1>
        <p className="text-gray-400">
          Please connect a repository to view analytics.
        </p>
      </div>
    );
  }

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (selectedRepo) {
      setLoading(true);
      axios
        .get(`${API}/commits`, {
          params: {
            accessToken: token,
            repo: selectedRepo.full_name,
          },
        })
        .then((res) => {
          console.log("✅ API response:", res.data);
          setCommits(res.data.commits);

          // Count commits per author
          const counts = {};
          res.data.commits.forEach((commit) => {
            const author = commit.author || "Unknown";
            counts[author] = (counts[author] || 0) + 1;
          });
          console.log("✅ authorCounts:", counts);
          setAuthorCounts(counts);

          // Fetch commit details for lines added/deleted
          const commitList = Array.isArray(res.data.commits)
            ? res.data.commits
            : [];
          Promise.all(
            commitList.slice(0, 30).map((c) => fetchCommitDetails(c.sha))
          )
            .then((details) => {
              const transformed = details.map((c) => ({
                name: c.commit.author.name,
                added: c.stats.additions,
                deleted: c.stats.deletions,
              }));
              console.log("✅ linesData transformed:", transformed);
              setLinesData(transformed);
            })
            .catch((err) => {
              setError("Failed to load commit data");
              console.error("❌ Commit details fetch error:", err);
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch((err) => {
          setError("Failed to load commit list");
          console.error("❌ Commit list fetch error:", err);
          setLoading(false);
        });
    }
  }, [selectedRepo]);

  const fetchCommitDetails = async (sha) => {
    const res = await axios.get(`${API}/commit-details`, {
      params: {
        accessToken: token,
        repo: selectedRepo.full_name,
        sha,
      },
    });
    return res.data;
  };

  const commitsByAuthor = useMemo(() => {
    const result = {};
    commits.forEach((commit) => {
      const author = commit.author || "Unknown";
      const date = new Date(commit.date).toISOString().split("T")[0];
      if (!result[author]) result[author] = {};
      result[author][date] = (result[author][date] || 0) + 1;
    });
    console.log("✅ commitsByAuthor:", result);
    return result;
  }, [commits]);

  const commitsOverTimeData = useMemo(() => {
    const flattened = Object.entries(commitsByAuthor).flatMap(
      ([author, dates]) =>
        Object.entries(dates).map(([date, count]) => ({
          author,
          date,
          count,
        }))
    );
    console.log("✅ commitsOverTimeData:", flattened);
    return flattened;
  }, [commitsByAuthor]);

  const reshapedData = useMemo(() => {
    const grouped = {};
    commitsOverTimeData.forEach(({ author, date, count }) => {
      if (!grouped[date]) grouped[date] = { date };
      grouped[date][author] = count;
    });

    const allAuthors = [...new Set(commitsOverTimeData.map((d) => d.author))];
    Object.values(grouped).forEach((entry) => {
      allAuthors.forEach((author) => {
        if (!entry[author]) entry[author] = 0;
      });
    });

    const result = Object.values(grouped);
    console.log("✅ reshapedData:", result);
    return result;
  }, [commitsOverTimeData]);

  const groupedLinesData = useMemo(() => {
    const result = {};
    linesData.forEach(({ name, added, deleted }) => {
      if (!result[name]) {
        result[name] = { name, added: 0, deleted: 0 };
      }
      result[name].added += added;
      result[name].deleted += deleted;
    });
    console.log("✅ groupedLinesData:", result);
    return Object.values(result);
  }, [linesData]);

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      <DashboardNavbar />
      <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Analytics & Trends
            </h1>
            <p className="text-gray-400 text-lg">
              Long-term insights into developer productivity and repository
              health
            </p>
          </div>
          <button
            onClick={() => alert("Export functionality coming soon!")}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 flex items-center border border-gray-600"
          >
            <FiDownload className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        {loading && <p className="text-gray-400 mb-4">Loading commit data...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-8">
          {reshapedData.length > 0 ? (
            <ChartCard title="Commits Per Developer Over Time" heightClass="h-96">
              <CommitsOverTimeChart data={reshapedData} />
            </ChartCard>
          ) : (
            <p className="text-gray-400 mb-4">Waiting for commit trend data...</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <ChartCard title="Lines Added vs Deleted" heightClass="h-96">
            <LinesAddedDeletedChart data={groupedLinesData} />
          </ChartCard>
          <ChartCard title="Contribution by Developer" heightClass="h-96">
            <div className="flex items-center justify-center w-full h-full bg-gray-900 rounded-lg p-2">
              <ContributionPieChart data={authorCounts} />
            </div>
          </ChartCard>
        </div>

        <KeyMetricsSummary commits={commits} />
      </main>
    </div>
  );
};

export default Trends;