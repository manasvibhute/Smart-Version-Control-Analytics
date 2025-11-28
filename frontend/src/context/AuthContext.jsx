// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jwtToken, setJwtToken] = useState(null);
  const [githubAccessToken, setGithubAccessToken] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const jwt = localStorage.getItem("jwtToken");
    const githubToken = localStorage.getItem("githubAccessToken");
    const storedUsername = localStorage.getItem("username");

    if (jwt || githubToken) setIsAuthenticated(true);
    if (jwt) setJwtToken(jwt);
    if (githubToken) setGithubAccessToken(githubToken);
    if (storedUsername) setUsername(storedUsername);
  }, []);

  const login = ({ jwt, githubAccessToken, username }) => {
    if (jwt) {
      localStorage.setItem("jwtToken", jwt);
      setJwtToken(jwt);
    }
    if (githubAccessToken) {
      localStorage.setItem("githubAccessToken", githubAccessToken);
      setGithubAccessToken(githubAccessToken);
    }
    if (username) {
      localStorage.setItem("username", username);
      setUsername(username);
    }
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("githubAccessToken");
    localStorage.removeItem("username");
    setJwtToken(null);
    setGithubAccessToken(null);
    setUsername(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, jwtToken, githubAccessToken, username, setUsername, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);