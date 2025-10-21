import { useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRepo } from "../context/RepoContext";

const Logout = () => {
  const { logout } = useContext(AuthContext);
  const { setSelectedRepo } = useRepo();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear JWT / AuthContext
    logout();
    setSelectedRepo(null);
    // Clear GitHub token from localStorage
    localStorage.removeItem("githubAccessToken");

    // Redirect to login page
    navigate("/login", { replace: true });

    // Optional: clear history stack to prevent back navigation
    window.history.pushState(null, "", "/login");
    window.onpopstate = () => {
      window.history.go(1);
    };
  }, [logout, navigate, setSelectedRepo]);

  return <p>Logging out...</p>;
};

export default Logout;
