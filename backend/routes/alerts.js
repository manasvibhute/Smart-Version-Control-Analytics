const express = require('express');
const router = express.Router();

// 🔧 GET alerts (placeholder logic)
router.get('/', async (req, res) => {
  const { accessToken, repo } = req.query;

  if (!accessToken || !repo) {
    return res.status(400).json({ error: 'Missing accessToken or repo' });
  }

  try {
    // Replace this with real logic later
    const alerts = [
      { id: 1, category: "Merge", message: "Merge conflict detected" },
      { id: 2, category: "Risk", message: "Risky file modified" },
      { id: 3, category: "Productivity", message: "Low commit activity this week" }
    ];

    res.json({ alerts });
  } catch (err) {
    console.error('❌ Alerts error:', err.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

module.exports = router;