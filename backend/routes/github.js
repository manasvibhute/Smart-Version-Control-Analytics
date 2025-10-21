// backend/routes/github.js
const express = require("express");
const axios = require("axios");
const router = express.Router();

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
    const response = await axios.get(`https://api.github.com/repos/${repo}/commits?per_page=100`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    res.json({ commits: response.data });
  } catch (err) {
    console.error("Error fetching commits:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch commits" });
  }
});

module.exports = router;
