// routes/risk.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/risky-modules", async (req, res) => {
  const { accessToken, repo } = req.query;

  if (!accessToken || !repo) {
    return res.status(400).json({ error: "Missing accessToken or repo" });
  }

  try {
    // Step 1: Fetch recent commits
    const commitsResponse = await axios.get(`https://api.github.com/repos/${repo}/commits`, {
      headers: { Authorization: `token ${accessToken}` },
      params: { per_page: 30 } // fetch 30 commits for analysis
    });

    const commits = commitsResponse.data;

    // Step 2: Track file stats
    const fileStats = {};

    for (const commit of commits) {
      const sha = commit.sha;
      const message = commit.commit.message.toLowerCase();

      // Fetch commit details (changed files)
      const detailsResponse = await axios.get(`https://api.github.com/repos/${repo}/commits/${sha}`, {
        headers: { Authorization: `token ${accessToken}` }
      });

      const files = detailsResponse.data.files || [];

      for (const f of files) {
        if (!fileStats[f.filename]) {
          fileStats[f.filename] = { changes: 0, deletions: 0, additions: 0, bugFixes: 0 };
        }

        fileStats[f.filename].changes += 1;
        fileStats[f.filename].deletions += f.deletions;
        fileStats[f.filename].additions += f.additions;

        if (message.includes("fix") || message.includes("bug") || message.includes("error")) {
          fileStats[f.filename].bugFixes += 1;
        }
      }
    }

    // Step 3: Compute risk scores
    const riskyFiles = Object.entries(fileStats).map(([filename, stats]) => {
      const rawScore = (stats.changes * 0.4 + stats.deletions * 0.2 + stats.bugFixes * 0.4);
      const risk = Math.min(100, Math.round(rawScore)); // scale directly to 0–100

      return {
        filename,
        risk,                  // ✅ matches frontend
        commits: stats.changes, // total commits touching this file
        bugFixes: stats.bugFixes,
        additions: stats.additions,
        deletions: stats.deletions,
      };
    });

    // Step 4: Sort and return top 5
    riskyFiles.sort((a, b) => b.risk - a.risk); // ✅ use risk, not riskScore
    const topFiles = riskyFiles.slice(0, 5);

    res.json({ riskyFiles: topFiles });
  } catch (err) {
    console.error("❌ Risky modules error:", err.message);
    res.status(500).json({ error: "Failed to compute risky modules" });
  }
});

module.exports = router;