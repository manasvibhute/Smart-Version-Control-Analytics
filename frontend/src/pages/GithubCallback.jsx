import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const hasExchanged = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jwt = params.get("jwt");
    const accessToken = params.get("accessToken");

    if (jwt && accessToken && !hasExchanged.current) {
      hasExchanged.current = true;

      console.log("JWT:", jwt);
      console.log("GitHub Access Token:", accessToken);

      // Save both
      localStorage.setItem("jwtToken", jwt);
      localStorage.setItem("githubAccessToken", accessToken);

      login({ jwt, githubAccessToken: accessToken });

      navigate("/repos");
    }
  }, [location, navigate, login]);

  return (
    <div className="text-white text-center mt-20">
      Processing GitHub login...
    </div>
  );
};

export default GitHubCallback;
