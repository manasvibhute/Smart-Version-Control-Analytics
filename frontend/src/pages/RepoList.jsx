import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useRepo } from "../context/RepoContext";

const RepoList = () => {
  const navigate = useNavigate();
  const [repos, setRepos] = useState([]);
  const { selectedRepo, setSelectedRepo } = useRepo();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const githubToken = localStorage.getItem("githubAccessToken");

  useEffect(() => {
  if (!githubToken) {
    navigate("/login");
    return;
  }

  const fetchRepos = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/github/repos", {
        headers: { Authorization: `Bearer ${githubToken}` },
      });

      setRepos(res.data.repos);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch repositories");
    } finally {
      setLoading(false);
    }
  };

  fetchRepos();
}, [githubToken, navigate]);


  if (!githubToken) return <p>Redirecting to login...</p>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="bg-green-600 text-white px-4 py-2 rounded mb-6">
        Successfully connected to GitHub!
      </div>

      {loading && <p>Loading repositories...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && repos.length > 0 && !selectedRepo && (
        <table className="w-full border-collapse border border-gray-700 text-left">
          <thead>
            <tr className="bg-gray-800">
              <th className="p-2 border border-gray-700">Name</th>
              <th className="p-2 border border-gray-700">Owner</th>
              <th className="p-2 border border-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {repos.map((repo) => (
              <tr key={repo.id} className="hover:bg-gray-700 cursor-pointer">
                <td className="p-2 border border-gray-700">{repo.name}</td>
                <td className="p-2 border border-gray-700">{repo.owner.login}</td>
                <td className="p-2 border border-gray-700">
                  <button
                    className="bg-cyan-600 px-3 py-1 rounded hover:bg-cyan-500"
                    onClick={() => {
                      setSelectedRepo(repo);
                      navigate("/dashboard");
                    }}
                  >
                    View Analytics
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedRepo && (
        <div className="mt-6">
          <button
            className="bg-gray-700 px-3 py-1 rounded mb-4 hover:bg-gray-600"
            onClick={() => setSelectedRepo(null)}
          >
            Back to Repositories
          </button>

          <h2 className="text-2xl font-bold mb-4">{selectedRepo.name} Analytics</h2>
          <div className="bg-gray-800 p-4 rounded">
            <p>Owner: {selectedRepo.owner.login}</p>
            <p>Full Name: {selectedRepo.full_name}</p>
            <p>Private: {selectedRepo.private ? "Yes" : "No"}</p>
            <p>Forks: {selectedRepo.forks_count}</p>
            <p>Stars: {selectedRepo.stargazers_count}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepoList;
