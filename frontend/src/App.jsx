import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";  
import Trends from "./pages/Trends";
import Alerts from "./pages/Alerts";
import RiskyModules from "./pages/RiskyModules";
import Commits from "./pages/Commits";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Logout from "./pages/Logout"; // updated
import GithubCallback from "./pages/GithubCallback";
import RepoList from "./pages/RepoList";
import { RepoProvider } from "./context/RepoContext";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => (
  <AuthProvider>
    <RepoProvider> {/* ✅ Wrap everything inside this */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/trends" element={
            <ProtectedRoute>
              <Trends />
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <Alerts />
            </ProtectedRoute>
          } />
          <Route path="/risky-modules" element={
            <ProtectedRoute>
              <RiskyModules />
            </ProtectedRoute>
          } />
          <Route path="/commits" element={
            <ProtectedRoute>
              <Commits />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/auth/github/callback" element={<GithubCallback />} />
          <Route path="/repos" element={
            <ProtectedRoute>
              <RepoList />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </RepoProvider>
  </AuthProvider>
);

export default App;
