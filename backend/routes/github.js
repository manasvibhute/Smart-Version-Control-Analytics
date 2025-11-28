// routes/github.js
const express = require("express");
const router = express.Router();
const axios = require("axios");
const authMiddleware = require("../middleware/auth");
const { predictAlert } = require("../ml/predictor");

function scoreFile(filename) {
  const lower = (filename || "").toLowerCase();
  let score = 0;
  if (lower.includes("navbar") || lower.includes("auth") || lower.includes("context")) score += 0.4;
  if (lower.endsWith(".jsx") || lower.endsWith(".tsx")) score += 0.3;
  if (lower.includes("dashboard") || lower.includes("alerts")) score += 0.2;
  return score;
}

// ✅ Get user repos
router.get("/repos", authMiddleware, async (req, res) => {
  const token = req.user?.accessToken;
  if (!token) {
    return res.status(401).json({ error: "No GitHub access token" });
  }

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `Bearer ${token}` },
    });

    res.json({ repos: response.data });
  } catch (err) {
    console.error("❌ Error fetching repos:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch repositories" });
  }
});

// ✅ Get commits for a repo
// Example: /github/commits?repo=owner/repoName
// routes/github.js
router.get("/commits", authMiddleware, async (req, res) => {
  const token = req.user?.accessToken;
  const repo = req.query.repo;

  if (!token) return res.status(401).json({ error: "No GitHub access token" });
  if (!repo) return res.status(400).json({ error: "Missing repo parameter" });

  try {
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/commits`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Fetch details for each commit (stats + files)
    const detailedCommits = await Promise.all(
      response.data.slice(0, 30).map(async (c) => {
        const detailRes = await axios.get(
          `https://api.github.com/repos/${repo}/commits/${c.sha}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const detail = detailRes.data;

        return {
          sha: c.sha,
          message: c.commit.message,
          author: c.commit.author?.name || "Unknown",
          date: c.commit.author?.date || new Date(),
          stats: detail.stats || { additions: 0, deletions: 0 },
          files: detail.files || [],
        };
      })
    );

    res.json({ commits: detailedCommits });
  } catch (err) {
    console.error("❌ Error fetching commits:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});

// Predictive alerts based on commits
router.get("/alerts", authMiddleware, async (req, res) => {
  const token = req.user?.accessToken;
  const repo = req.query.repo;

  if (!token) return res.status(401).json({ error: "No GitHub access token" });
  if (!repo) return res.status(400).json({ error: "Missing repo parameter" });

  try {
    // Fetch recent commits
    const response = await axios.get(
      `https://api.github.com/repos/${repo}/commits`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Fetch commit details (files) for each commit
    const detailedCommits = await Promise.all(
      response.data.slice(0, 30).map(async (c) => {
        const detailRes = await axios.get(
          `https://api.github.com/repos/${repo}/commits/${c.sha}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const detail = detailRes.data;

        return {
          sha: c.sha,
          message: c.commit?.message || "",
          author: c.commit?.author?.name || "Unknown",
          timestamp: c.commit?.author?.date || new Date().toISOString(),
          files: detail.files || [], // [{ filename, ... }]
        };
      })
    );
    // Generate alerts from commits
    const alerts = detailedCommits
      .map((commit) => {
        const prediction = predictAlert({
          message: commit.message,
          files: commit.files, // array of file objects
          author: commit.author,
          timestamp: commit.timestamp,
          sha: commit.sha,
        });
        if (!prediction) return null;

        // Build riskyFiles from impacted filenames
        const impactedFilenames = (commit.files || []).map(f => f.filename);
        const riskyFiles = impactedFilenames
          .map(f => ({ filename: f, risk: scoreFile(f) }))
          .sort((a, b) => b.risk - a.risk)
          .slice(0, 3);

        const commitUrl = `https://github.com/${repo}/commit/${commit.sha}`;
        return {
          id: commit.sha,                  // stable id
          category: prediction.category,   // Merge | Risk | Duplicate | Productivity
          reviewed: false,
          time: commit.timestamp,
          title: `Predicted issue in ${impactedFilenames.length} files`,
          prediction: {
            riskScore: prediction.riskScore,         // number (0–1)
            confidence: prediction.confidence,       // number (0–1)
            model: prediction.model,
            explanation: prediction.explanation,
            impactedFiles: impactedFilenames,        // strings only
            riskyFiles,                              // [{ filename, risk }]
            features: prediction.features,
          },
          sha: commit.sha,
          html_url: commitUrl,
        };
      })
      .filter(Boolean);
    res.json({ alerts });
  } catch (err) {
    console.error("❌ Error generating alerts:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate predictive alerts" });
  }
});


module.exports = router;