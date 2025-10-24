import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import ChartCard from "../components/trends/ChartCard";
import CommitsOverTimeChart from "../components/trends/CommitsOverTimeChart";
import LinesAddedDeletedChart from "../components/trends/LinesAddedDeletedChart";
import ContributionPieChart from "../components/trends/ContributionPieChart";
import KeyMetricsSummary from "../components/trends/KeyMetricsSummary";
import { FiDownload } from "react-icons/fi";
import BugFrequencyChart from "../components/trends/BugFrequencyChart";
import { useNavigate } from "react-router-dom";
import { useRepo } from "../context/RepoContext";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

const Trends = () => {
    const { selectedRepo } = useRepo();
    const [commits, setCommits] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [linesData, setLinesData] = useState([]);
    const [issueData, setIssueData] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("githubAccessToken");
    const [authorCounts, setAuthorCounts] = useState({});

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
                    console.log("✅ API response:", res.data);
                    setCommits(res.data.commits);

                    const counts = {};
                    res.data.commits.forEach((commit) => {
                        const author =
                            commit?.author?.login ||
                            commit?.commit?.author?.name ||
                            "Unknown";
                        counts[author] = (counts[author] || 0) + 1;
                    });
                    console.log("✅ authorCounts:", counts);
                    setAuthorCounts(counts);

                    const commitList = Array.isArray(res.data.commits) ? res.data.commits : [];
                    Promise.all(commitList.slice(0, 30).map((c) => fetchCommitDetails(c.sha)))
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

    useEffect(() => {
  if (selectedRepo) {
    console.log("🐞 Fetching issues for:", selectedRepo.full_name);

    axios
      .get(`https://api.github.com/repos/${selectedRepo.full_name}/issues?state=all&per_page=100`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("✅ issueData:", res.data);

        if (res.data.length === 0) {
          console.warn("⚠️ No issues found, injecting dummy data for testing");
          setIssueData([
            {
              created_at: "2025-01-10T00:00:00Z",
              closed_at: "2025-01-15T00:00:00Z",
              labels: [{ name: "bug" }],
            },
            {
              created_at: "2025-02-05T00:00:00Z",
              closed_at: "2025-02-10T00:00:00Z",
              labels: [{ name: "bug" }],
            },
          ]);
        } else {
          setIssueData(res.data);
        }
      })
      .catch((err) => {
        console.error("❌ Issue fetch error:", err);
      });
  }
}, [selectedRepo]);

    const fetchCommitDetails = async (sha) => {
        const res = await axios.get(`https://api.github.com/repos/${selectedRepo.full_name}/commits/${sha}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };

    const commitsByAuthor = useMemo(() => {
        const result = {};
        commits.forEach((commit) => {
            const author =
                commit?.author?.login ||
                commit?.commit?.author?.name ||
                "Unknown";
            const date = new Date(commit.commit.author.date).toISOString().split("T")[0];
            if (!result[author]) result[author] = {};
            result[author][date] = (result[author][date] || 0) + 1;
        });
        console.log("✅ commitsByAuthor:", result);
        return result;
    }, [commits]);

    const commitsOverTimeData = useMemo(() => {
        const flattened = Object.entries(commitsByAuthor).flatMap(([author, dates]) =>
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

        const allAuthors = [...new Set(commitsOverTimeData.map(d => d.author))];
        Object.values(grouped).forEach(entry => {
            allAuthors.forEach(author => {
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

    const getMonthLabels = () => {
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const months = new Set();
        issueData.forEach((issue) => {
            const date = new Date(issue.created_at);
            const label = date.toLocaleString("default", { month: "short" });
            months.add(label);
        });
        return monthOrder.filter((m) => months.has(m));
    };

    const getBugCountsByMonth = (type) => {
        const counts = {};
        issueData.forEach((issue) => {
            const date = new Date(type === "reported" ? issue.created_at : issue.closed_at);
            if (!date || isNaN(date)) return;
            const label = date.toLocaleString("default", { month: "short" });
            counts[label] = (counts[label] || 0) + 1;
        });

        const labels = getMonthLabels();
        return labels.map((label) => counts[label] || 0);
    };
    console.log("🐞 Trends component rendered, issueData length:", issueData.length);
    const bugChartData = useMemo(() => {
        console.log("🐞 bugChartData useMemo triggered");

        if (!issueData || issueData.length === 0) {
            console.log("⚠️ issueData is empty, skipping bug chart");
            return { labels: [], datasets: [] };
        }

        const labels = getMonthLabels();
        const reported = getBugCountsByMonth("reported");
        const fixed = getBugCountsByMonth("fixed");

        console.log("✅ Month labels:", labels); // ← ADD HERE
        console.log("✅ Bugs Reported:", reported); // ← ADD HERE
        console.log("✅ Bugs Fixed:", fixed);

        const chart = {
            labels,
            datasets: [
                {
                    label: "Bugs Reported",
                    data: reported,
                    borderColor: "#f87171",
                    backgroundColor: "rgba(248, 113, 113, 0.3)",
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: "Bugs Fixed",
                    data: fixed,
                    borderColor: "#34d399",
                    backgroundColor: "rgba(52, 211, 153, 0.3)",
                    fill: true,
                    tension: 0.4,
                },
            ],
        };
        console.log("✅ bugChartData:", chart);
        return chart;
    }, [issueData]);

    return (
        <div className="min-h-screen bg-gray-950 font-sans text-white">
            <DashboardNavbar />
            <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Analytics & Trends</h1>
                        <p className="text-gray-400 text-lg">
                            Long-term insights into developer productivity and repository health
                        </p>
                    </div>
                    <button 
                    onClick={() => alert("Export functionality coming soon!")}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 flex items-center border border-gray-600">
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

                <div className="mb-8">
                    <ChartCard title="Bug Frequency Trends" heightClass="h-80">
                        <div className="flex items-center justify-center h-full text-gray-500">
                            <BugFrequencyChart data={bugChartData} />
                        </div>
                    </ChartCard>
                </div>

                <KeyMetricsSummary commits={commits} bugChartData={bugChartData} />
            </main>
        </div>
    );
};

export default Trends;