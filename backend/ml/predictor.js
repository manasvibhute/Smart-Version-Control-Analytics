function predictAlert({ message, files, author, timestamp }) {
  const lowerMessage = message.toLowerCase();
  const fileCount = files.length;

  // Feature weights
  const keywordRisk = /conflict|merge|hotfix|bug|fix/.test(lowerMessage) ? 0.7 : 0.3;
  const fileRisk = fileCount > 10 ? 0.6 : fileCount > 5 ? 0.4 : 0.2;
  const authorRisk = author === "dependabot[bot]" ? 0.1 : 0.3;

  // Simulated ML scoring
  const rawScore = (keywordRisk + fileRisk + authorRisk) / 3;
  const riskScore = Math.round(rawScore * 100) / 100;

  // Filter out low-risk predictions
  if (riskScore < 0.6) return null;

  const category = /merge|conflict/.test(lowerMessage)
    ? "Merge"
    : /duplicate|copy|redundant/.test(lowerMessage)
    ? "Duplicate"
    : fileCount > 10
    ? "Productivity"
    : "Risk";

  return {
    title: `Predicted issue in ${fileCount} files`,
    category,
    details: `ML model flagged this commit with ${Math.round(riskScore * 100)}% risk.`,
    riskScore,
    confidence: 0.85,
    model: "commit_alert_v2",
    features: ["keywordRisk", "fileCount", "authorActivity"],
    impactedFiles: files,
    explanation: `Commit message and file count suggest potential ${category.toLowerCase()} issue.`,
  };
}

module.exports = { predictAlert };