import React from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import ChartCard from "../components/trends/ChartCard";
import CommitsOverTimeChart from "../components/trends/CommitsOverTimeChart";
import LinesAddedDeletedChart from "../components/trends/LinesAddedDeletedChart";
import ContributionPieChart from "../components/trends/ContributionPieChart";
import KeyMetricsSummary from "../components/trends/KeyMetricsSummary";
import { FiDownload } from "react-icons/fi";
import BugFrequencyChart from "../components/trends/BugFrequencyChart";
import { useNavigate } from "react-router-dom"; // added
import { useRepo } from "../context/RepoContext";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";

const Trends = () => {
    const { selectedRepo } = useRepo();
    const [commits, setCommits] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [linesData, setLinesData] = useState([]);
    const navigate = useNavigate();
    const token = localStorage.getItem("githubAccessToken");
    const [authorCounts, setAuthorCounts] = useState({});
    const commitsByAuthor = useMemo(() => {
        const result = {};
        commits.forEach((commit) => {
            const author = commit?.commit?.author?.name || "Unknown";
            const date = new Date(commit.commit.author.date).toISOString().split("T")[0];
            if (!result[author]) result[author] = {};
            result[author][date] = (result[author][date] || 0) + 1;
        });
        return result;
    }, [commits]);

    const bugChartData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], // or dynamically generated
        datasets: [
            {
                label: "Bugs Reported",
                data: [12, 8, 15, 10, 6, 9],
                borderColor: "#f87171",
                backgroundColor: "rgba(248, 113, 113, 0.3)",
                fill: true,
                tension: 0.4,
            },
            {
                label: "Bugs Fixed",
                data: [10, 7, 12, 9, 5, 8],
                borderColor: "#34d399",
                backgroundColor: "rgba(52, 211, 153, 0.3)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const commitsOverTimeData = useMemo(() => {
        return Object.entries(commitsByAuthor).flatMap(([author, dates]) =>
            Object.entries(dates).map(([date, count]) => ({
                author,
                date,
                count,
            }))
        );
    }, [commitsByAuthor]);

    useEffect(() => {
        if (!token) {
            navigate("/login", { replace: true }); // redirect if not logged in
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

                    // ✅ Count commits per author
                    const counts = {};
                    res.data.commits.forEach((commit) => {
                        const author = commit?.commit?.author?.name || "Unknown";
                        counts[author] = (counts[author] || 0) + 1;
                    });
                    setAuthorCounts(counts);

                    // ✅ Fetch commit details for lines added/deleted
                    const commitList = Array.isArray(res.data.commits) ? res.data.commits : [];
                    Promise.all(commitList.slice(0, 30).map((c) => fetchCommitDetails(c.sha)))
                        .then((details) => {
                            const transformed = details.map((c) => ({
                                name: c.commit.author.name,
                                added: c.stats.additions,
                                deleted: c.stats.deletions,
                            }));
                            setLinesData(transformed);
                        })
                        .catch((err) => {
                            setError("Failed to load commit data");
                        })
                        .finally(() => {
                            setLoading(false);
                        });
                })
                .catch((err) => {
                    setError("Failed to load commit list");
                    setLoading(false);
                });
        }
    }, [selectedRepo]);
    const fetchCommitDetails = async (sha) => {
        const res = await axios.get(`https://api.github.com/repos/${selectedRepo.full_name}/commits/${sha}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    };
    const reshapedData = useMemo(() => {
        const grouped = {};

        commitsOverTimeData.forEach(({ author, date, count }) => {
            if (!grouped[date]) grouped[date] = { date };
            grouped[date][author] = count;
        });

        const result = Object.values(grouped);
        console.log("Reshaped commit data:", result);
        return result;
    }, [commitsOverTimeData]);
    return (
        <div className="min-h-screen bg-gray-950 font-sans text-white">
            <DashboardNavbar />

            <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Dashboard Header */}
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Analytics & Trends</h1>
                        <p className="text-gray-400 text-lg">
                            Long-term insights into developer productivity and repository health
                        </p>
                    </div>
                    <button className="px-4 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600 transition duration-200 flex items-center border border-gray-600">
                        <FiDownload className="w-4 h-4 mr-2" />
                        Export Report
                    </button>
                </div>

                {/* Charts */}
                {loading && (
                    <p className="text-gray-400 mb-4">Loading commit data...</p>
                )}
                {error && (
                    <p className="text-red-500 mb-4">{error}</p>
                )}
                <div className="mb-8">
                    <ChartCard title="Commits Per Developer Over Time" heightClass="h-96">
                        <CommitsOverTimeChart data={reshapedData} />
                    </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <ChartCard title="Lines Added vs Deleted" heightClass="h-96">
                        <LinesAddedDeletedChart data={linesData} />
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

                <KeyMetricsSummary />
            </main>
        </div>
    );
};

export default Trends;
