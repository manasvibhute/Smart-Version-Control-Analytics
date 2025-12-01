const express = require('express');
const router = express.Router();
const axios = require('axios');

// 🔧 GET issues from GitHub using accessToken and repo name
router.get('/', async (req, res) => {
  const { accessToken, repo } = req.query;

  if (!accessToken || !repo) {
    return res.status(400).json({ error: 'Missing accessToken or repo' });
  }

  try {
    const url = `https://api.github.com/repos/${repo}/issues`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json(response.data);
  } catch (err) {
    console.error('❌ GitHub issues error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch issues' });
  }
});

module.exports = router;