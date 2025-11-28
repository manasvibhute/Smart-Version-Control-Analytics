function predictAlert({ message, files, author, timestamp, sha }) {
    const lowerMessage = message.toLowerCase();
    const fileCount = files.length;

    // Feature weights
    const keywordRisk = lowerMessage.includes("hotfix") ? 0.8 :
        lowerMessage.includes("conflict") ? 0.7 :
            lowerMessage.includes("fix") ? 0.6 :
                0.3;

    const fileRisk = fileCount === 0 ? 0.1 :
        fileCount <= 2 ? 0.3 :
            fileCount <= 5 ? 0.5 :
                fileCount <= 10 ? 0.7 : 0.9;

    const authorRisk = author.includes("bot") ? 0.1 : 0.4;

    // Simulated ML scoring
    const rawScore = (keywordRisk + fileRisk + authorRisk) / 3;
    let riskScore = Number(rawScore.toFixed(2));
    if (isNaN(riskScore)) riskScore = 0;   // fallback

    console.log("Scoring commit:", message);
    console.log("Risk score:", riskScore);

    // Filter out low-risk predictions
    if (riskScore < 0.4) return null;

    const category = /merge|conflict/.test(lowerMessage)
        ? "Merge"
        : /duplicate|copy|redundant/.test(lowerMessage)
            ? "Duplicate"
            : fileCount > 10
                ? "Productivity"
                : "Risk";

    const highRisk = riskScore >= 0.8;

    return {
        id: sha,
        sha,
        title: `Predicted issue in ${fileCount} files`,
        category, // must be one of: "Merge", "Risk", "Duplicate", "Productivity"
        reviewed: false,
        highRisk,
        prediction: {
            riskScore, // must be a number, not string
            confidence: 0.85,
            model: "commit_alert_v2",
            explanation: `Commit message and file count suggest potential ${category.toLowerCase()} issue.`,
            impactedFiles: files.map(f => f.filename),
            features: ["keywordRisk", "fileCount", "authorActivity"],
        },
        time: timestamp,
    };
}

module.exports = { predictAlert };