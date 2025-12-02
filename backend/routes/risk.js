// routes/risk.js
const express = require("express");
const router = express.Router();

router.get("/risky-modules", async (req, res) => {
  const { accessToken, repo } = req.query;

  if (!accessToken || !repo) {
    return res.status(400).json({ error: "Missing accessToken or repo" });
  }

  // 🔧 Mock risky files for testing
  const riskyFiles = [
    { filename: "src/components/Dashboard.jsx", riskScore: 0.72 },
    { filename: "src/utils/api.js", riskScore: 0.65 },
    { filename: "src/hooks/useAlerts.js", riskScore: 0.61 },
    { filename: "src/pages/Trends.jsx", riskScore: 0.59 },
    { filename: "src/styles/theme.css", riskScore: 0.55 },
  ];

  res.json({ riskyFiles });
});

module.exports = router;