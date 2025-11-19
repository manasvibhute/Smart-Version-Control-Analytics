import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import MetricCard from "../components/dashboard/MetricCard";
import ChartContainer from "../components/dashboard/ChartContainer";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import RecentAlertsList from "../components/dashboard/RecentAlertsList";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiGitCommit, FiActivity } from "react-icons/fi";
import { FaBug } from "react-icons/fa";
import { useRepo } from "../context/RepoContext";
import axios from "axios";

const Dashboard = () => {
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
  const [alerts, setAlerts] = useState([]);
  const [issues, setIssues] = useState([]);
  const { setRepoHealth } = useRepo();

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

  // Helper functions
  const isThisWeek = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return date >= startOfWeek;
  };

  const isLastWeek = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfLastWeek = new Date(now);
    startOfLastWeek.setDate(now.getDate() - now.getDay() - 7);
    startOfLastWeek.setHours(0, 0, 0, 0);
    const endOfLastWeek = new Date(startOfLastWeek);
    endOfLastWeek.setDate(startOfLastWeek.getDate() + 6);
    endOfLastWeek.setHours(23, 59, 59, 999);
    return date >= startOfLastWeek && date <= endOfLastWeek;
  };

  // Metrics
  const totalCommits = commits.length;

  const dailyAdditions = commits.reduce((sum, commit) => {
    const additions = commit.stats?.additions || 0;
    return sum + additions;
  }, 0);

  const totalBugs = commits.filter((commit) =>
    commit.commit.message.toLowerCase().includes("fix") ||
    commit.commit.message.toLowerCase().includes("bug")
  ).length;

  const currentWeekCommits = commits.filter(c => isThisWeek(c.commit.author.date)).length;
  const lastWeekCommits = commits.filter(c => isLastWeek(c.commit.author.date)).length;

  const trend = lastWeekCommits > 0
    ? `${Math.round(((currentWeekCommits - lastWeekCommits) / lastWeekCommits) * 100)}%`
    : "+0%";

  const metrics = [
    {
      title: "Commits",
      value: totalCommits,
      unit: "",
      trend,
      status: "Activity this week",
      icon: FiGitCommit,
      iconColor: "text-blue-400",
      trendColor: "text-green-400",
    },
    {
      title: "Bugs Reported",
      value: totalBugs,
      unit: "",
      trend,
      status: "Bug-related commits",
      icon: FaBug,
      iconColor: "text-red-400",
      trendColor: "text-red-400",
    },
    {
      title: "Lines Added",
      value: dailyAdditions,
      unit: "",
      trend,
      status: "Codebase growth",
      icon: FiActivity,
      iconColor: "text-green-400",
      trendColor: "text-green-400",
    },
  ];

  // Chart data
  const dailyCounts = {};
  commits.forEach((commit) => {
    const date = new Date(commit.commit.author.date).toISOString().split("T")[0];
    dailyCounts[date] = (dailyCounts[date] || 0) + 1;
  });

  const chartData = Object.entries(dailyCounts).map(([date, count]) => ({ date, count }));

  const commitAlerts = commits
    .filter(c => /fix|bug|hotfix|crash|error|patch/i.test(c.commit.message))
    .map((c, index) => ({
      id: index,
      title: "Bug-related commit",
      severity: "Medium",
      details: c.commit.message,
      time: new Date(c.commit.author.date).toLocaleString(),
      action: "Inspect",
    }));

  useEffect(() => {
    if (selectedRepo) {
      axios
        .get(`https://api.github.com/repos/${selectedRepo.full_name}/issues?state=open&labels=bug`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setIssues(res.data))
        .catch((err) => console.error("Failed to fetch issues:", err.response?.data || err.message));
    }
  }, [selectedRepo]);

  const issueAlerts = issues.map((issue) => ({
    id: issue.id,
    title: "Open Bug Issue",
    severity: "High",
    details: issue.title,
    time: new Date(issue.created_at).toLocaleString(),
    action: "Resolve",
  }));

  const allAlerts = [...alerts, ...commitAlerts, ...issueAlerts].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );

  useEffect(() => {
    if (!selectedRepo || !selectedRepo.full_name) return;

    const fetchHealthData = async () => {
      console.log("✅ Calculating health for:", selectedRepo.full_name);
      try {
        const [alertsRes, commitsRes] = await Promise.all([
          axios.get("http://localhost:5000/github/alerts", {
            params: { repo: selectedRepo.full_name },
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/github/commits", {
            params: { repo: selectedRepo.full_name },
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const alerts = alertsRes.data.alerts || [];
        const commits = commitsRes.data.commits || [];

        const riskyCommits = commits.filter(c => c.riskScore >= 0.6).length;
        const avgAlertRisk = alerts.length
          ? alerts.reduce((sum, a) => {
            const score = parseFloat(a.prediction?.riskScore || 0);
            return sum + (isNaN(score) ? 0 : score);
          }, 0) / alerts.length
          : 0;
        console.log("🐛 riskyCommits:", riskyCommits);
        console.log("🐛 avgAlertRisk:", avgAlertRisk);

        const healthScore = Math.round(
          100 - (riskyCommits * 5 + avgAlertRisk * 30)
        );
        console.log("📊 Calculated health score:", healthScore);
        setRepoHealth(Math.max(0, Math.min(100, healthScore)));
      } catch (err) {
        console.error("❌ Failed to calculate repo health:", err.response?.data || err.message);
      }
    };

    fetchHealthData();
  }, [selectedRepo, token, setRepoHealth]);

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      <DashboardNavbar />

      <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Metric Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, i) => (
              <MetricCard key={i} {...metric} />
            ))}
          </div>
        )}

        {/* Charts Section */}
        <div className="mb-8">
          <ChartContainer title="Commits Per Day">
            <CommitsPerDayChart data={chartData} />
          </ChartContainer>
        </div>

        {/* Recent Commits */}
        {error && <p className="text-red-500">{error}</p>}
        {commits.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Recent Commits</h3>
            <ul className="space-y-2">
              {commits.slice(0, 5).map((commit) => (
                <li key={commit.sha} className="text-sm text-gray-300">
                  <strong>{commit.commit.author.name}</strong>: {commit.commit.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;