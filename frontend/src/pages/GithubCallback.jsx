import React, { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const GitHubCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const hasExchanged = useRef(false); // ✅ faster, persistent flag

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");

    if (code && !hasExchanged.current) {
      hasExchanged.current = true;

      console.log("Sending code to backend:", code);

      axios
        .post("http://localhost:5000/github/exchange-token", { code })
        .then((res) => {
          console.log("Token response:", res.data);
          const token = res.data.access_token;
          if (token) {
            login(token);
            window.history.replaceState({}, document.title, "/github-callback");
            console.log("Navigating to /repos");
            navigate("/repos");
          } else {
            console.error("No token received", res.data);
            navigate("/connect-repo");
          }
        })
        .catch((err) => {
          console.error("Token exchange failed:", err.response?.data || err.message);
          navigate("/connect-repo");
        });
    }
  }, [location, navigate, login]);

  return <div className="text-white text-center mt-20">Processing GitHub login...</div>;
};

export default GitHubCallback;