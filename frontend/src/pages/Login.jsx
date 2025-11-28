import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FiGithub, FiGitBranch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const GitConnectButton = ({ provider, icon: Icon }) => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const githubClientId = "Ov23liD61pAdYbyn6Tpg";
  const githubRedirectUri = "http://localhost:5000/auth/github/callback";

  const handleConnect = () => {
  const scope = encodeURIComponent("repo read:user security_events");
  const url = `https://github.com/login/oauth/authorize?client_id=${githubClientId}&redirect_uri=${githubRedirectUri}&scope=${scope}`;
  window.location.href = url; // redirects user to GitHub
};

  return (
    <button
      onClick={handleConnect}
      className={`w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-lg text-white font-semibold transition-all duration-200 ${
        provider === "GitHub"
          ? "bg-cyan-600 hover:bg-cyan-500 shadow-lg shadow-cyan-900/50"
          : "bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/80"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span>Continue with {provider}</span>
    </button>
  );
};

const Login = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#070e17]">
    <div className="w-full max-w-sm p-8 bg-[#101726] rounded-xl shadow-xl border border-gray-800/50 space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <FiGitBranch className="w-10 h-10 text-cyan-500" />
        <h1 className="text-2xl font-bold text-white">Login to SVCA</h1>
      </div>
      <GitConnectButton provider="GitHub" icon={FiGithub} />
    </div>
  </div>
);

export default Login;
