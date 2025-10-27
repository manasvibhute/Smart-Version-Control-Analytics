// backend/routes/github.js
const express = require("express");
const axios = require("axios");
const router = express.Router();
const { predictAlert } = require("../ml/predictor");
// POST /github/exchange-token
router.post("/exchange-token", async (req, res) => {
  const { code } = req.body;

  console.log("Received code:", req.body.code);
  if (!code) {
    return res.status(400).json({ error: "Missing code in request body" });
  }

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;
  console.log("Using client_id:", client_id);
console.log("Using client_secret:", client_secret);


  try {
    const response = await axios.post(
      "https://github.com/login/oauth/access_token",
      { client_id, client_secret, code },
      { headers: { Accept: "application/json" } }
    );

    // response.data will contain access_token
    const { access_token, token_type, scope, error, error_description } = response.data;

    if (error) {
      return res.status(400).json({ error, error_description });
    }

    res.json({ access_token, token_type, scope });
  } catch (err) {
    console.error("GitHub token exchange error:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to exchange code for access token" });
  }
});

router.post("/predict", (req, res) => {
  const prediction = predictAlert(req.body);
  res.json(prediction);
});


router.get("/repos", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid Authorization header" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Received GitHub token:", token); 

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json({ repos: response.data });
  } catch (err) {
    console.error("Error fetching repos:", err.message);
    res.status(500).json({ error: "Failed to fetch repositories from GitHub" });
  }
});

router.get("/commits", async (req, res) => {
  const { repo } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  if (!repo || !token) {
    return res.status(400).json({ error: "Missing repo or token" });
  }

  try {
    // Step 1: Get basic commit list
    const response = await axios.get(`https://api.github.com/repos/${repo}/commits?per_page=20`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const commitList = response.data;

    // Step 2: Fetch full details for each commit
    const detailedCommits = await Promise.all(
      commitList.map(async (commit) => {
        const sha = commit.sha;
        try {
          const fullCommit = await axios.get(`https://api.github.com/repos/${repo}/commits/${sha}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3+json",
            },
          });
          return fullCommit.data;
        } catch (err) {
          console.error(`Failed to fetch commit ${sha}:`, err.message);
          return commit; // fallback to basic commit if detailed fetch fails
        }
      })
    );

    res.json({ commits: detailedCommits });
  } catch (err) {
    console.error("Error fetching commits:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});

router.get("/alerts", async (req, res) => {
  console.log("⚡ /github/alerts route hit");
  const { repo } = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  if (!repo || !token) {
    return res.status(400).json({ error: "Missing repo or token" });
  }

  try {
    const commitsRes = await axios.get(`https://api.github.com/repos/${repo}/commits?per_page=50`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const commits = commitsRes.data;

    console.log("Fetched commit messages:", commits.map(c => c.commit.message));

    const detailedCommits = await Promise.all(
      commits.map(async (commit) => {
        const sha = commit.sha;
        try {
          const fullCommit = await axios.get(`https://api.github.com/repos/${repo}/commits/${sha}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("Full commit object:", fullCommit.data);
          return fullCommit.data;
        } catch (err) {
          return commit; // fallback to basic commit
        }
      })
    );
    const alerts = detailedCommits
      .map((commit, index) => {
        const sha = commit.sha.slice(0, 7);
        const message = commit.commit.message;
        const files = commit.files?.map((f) => f.filename) || [];
        console.log("Files changed:", files);
        const author = commit.commit.author.name;
        const timestamp = commit.commit.author.date;

        const prediction = predictAlert({ message, files, author, timestamp });

        if (!prediction) return null;

        return {
          id: index + 1,
          title: prediction.title,
          category: prediction.category,
          details: prediction.details,
          time: new Date(timestamp).toLocaleString(),
          reviewed: false,
          prediction,
        };
      })
      .filter(Boolean); // remove nulls

    res.json({ alerts });
  } catch (err) {
    console.error("Error generating alerts:", err.message);
    res.status(500).json({ error: "Failed to generate alerts" });
  }
});

module.exports = router;
