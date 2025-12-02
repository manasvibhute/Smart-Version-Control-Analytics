const express = require('express');
const router = express.Router();
const axios = require('axios');
const { predictAlert } = require('../ml/predictor')

router.get('/', async (req, res) => {
  const { accessToken, repo } = req.query;

  if (!accessToken || !repo) {
    return res.status(400).json({ error: 'Missing accessToken or repo' });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${repo}/commits`, {
      headers: { Authorization: `token ${accessToken}` },
      params: { per_page: 20 } // limit for performance
    });

    const commits = response.data;

    const alerts = [];

    for (const commit of commits) {
      const sha = commit.sha;
      const message = commit.commit.message;
      const author = commit.author?.login || commit.commit.author?.name || "unknown";
      const timestamp = commit.commit.author?.date;

      // Fetch commit details to get changed files
      const commitDetails = await axios.get(`https://api.github.com/repos/${repo}/commits/${sha}`, {
        headers: { Authorization: `token ${accessToken}` }
      });

      const files = commitDetails.data.files || [];

      const alert = predictAlert({ message, files, author, timestamp, sha });
      if (alert) alerts.push(alert);
    }

    res.json({ alerts });
  } catch (err) {
    console.error('❌ Alerts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;