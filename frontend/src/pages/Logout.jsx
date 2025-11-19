import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRepo } from "../context/RepoContext";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const { clearRepo } = useRepo();
  const navigate = useNavigate();

  useEffect(() => {
    // 1️⃣ Clear authentication state
    logout();

    // 2️⃣ Clear selected repo + repo health
    clearRepo();

    // 3️⃣ Clear GitHub token from localStorage
    localStorage.removeItem("githubAccessToken");

    // 4️⃣ Redirect to login page
    navigate("/login", { replace: true });
  }, [logout, clearRepo, navigate]);

  return <p>Logging out...</p>;
};

export default Logout;
