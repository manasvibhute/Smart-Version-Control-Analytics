import React from "react";
import { FiGithub } from "react-icons/fi";
import { useNavigate } from "react-router-dom"; // added
import DashboardNavbar from "../components/DashboardNavbar";
import RepositoryConnectionCard from "../components/connectRepo/RepositoryConnectionCard";
import ConnectedRepositoriesTable from "../components/connectRepo/ConnectedRepositoriesTable";
import { useState, useEffect } from "react";

const ConnectRepository = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("githubAccessToken");
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true }); // redirect if not logged in
    }
  }, [token, navigate]);
  const githubClientId = "Ov23liD61pAdYbyn6Tpg";

  const githubRedirectUri = "https://smart-version-control-analytics.onrender.com/auth/github/callback";

  const [loading, setLoading] = useState(false);

  const connectGithub = () => {
    setLoading(true); // show "Connecting..."

    const scope = encodeURIComponent("repo read:user security_events");
    const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${githubRedirectUri}&scope=${scope}`;

    // give React a tick to render the loading message
    setTimeout(() => {
      window.location.href = url;
    }, 500); // 0.5s delay
  };

  return (
    <div className="min-h-screen bg-gray-950 font-sans text-white">
      <DashboardNavbar />

      <main className="pt-20 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Connect Your Repository</h1>
          <p className="text-gray-400 text-lg">
            Link your GitHub repository to start analyzing your code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <RepositoryConnectionCard
            icon={FiGithub}
            title="GitHub"
            onConnect={connectGithub} // pass function
            loading={loading}
          />
        </div>

        <ConnectedRepositoriesTable />
      </main>
    </div>
  );
};

export default ConnectRepository;
