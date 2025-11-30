const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const authMiddleware = require('../middleware/auth');

console.log('repos.js loaded');

// --- GET all GitHub repos of authenticated user ---
router.get('/', async (req, res) => {
  try {
    const token = req.query.accessToken;  // <- coming from frontend

    if (!token) {
      return res.status(400).json({ error: "Missing GitHub access token" });
    }

    const githubRes = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `token ${token}` }
    });

    res.json(githubRes.data);

  } catch (err) {
    console.error("❌ Error fetching repos:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to fetch repos" });
  }
});


// --- GET all commits in DB for authenticated user ---
router.get('/commits', authMiddleware, async (req, res) => {
  try {
    const commits = await prisma.commit.findMany({
      where: { repository: { ownerId: req.user.id } },
      include: { repository: true },
    });
    res.json(commits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- POST /github/:repoId fetch commits dynamically ---
router.post('/github/:repoId', authMiddleware, async (req, res) => {
  const { repoId } = req.params;

  try {
    // 1️⃣ Fetch repo from DB and ensure it belongs to the user
    let repo = await prisma.repository.findUnique({
      where: { id: parseInt(repoId) },
      include: { owner: true },
    });

    if (!repo || repo.ownerId !== req.user.id) {
      return res.status(403).json({ error: 'Repo not found or access denied' });
    }

    const token = req.user.accessToken;
    if (!token) return res.status(403).json({ error: "No GitHub access token" });

    const repoRes = await axios.get(
      `https://api.github.com/repos/${repo.owner.username}/${repo.name}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const realOwnerUsername = repoRes.data.owner.login;

    // 3️⃣ Update DB with actual GitHub owner if not stored
    if (repo.githubOwnerUsername !== realOwnerUsername) {
      repo = await prisma.repository.update({
        where: { id: parseInt(repoId) },
        data: { githubOwnerUsername: realOwnerUsername },
      });
    }

    // 4️⃣ Fetch commits using actual owner
    const commitsRes = await axios.get(
      `https://api.github.com/repos/${realOwnerUsername}/${repo.name}/commits`,
      { headers: { 'User-Agent': 'SVCA-App', Authorization: `token ${token}` } }
    );

    const commits = commitsRes.data.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      repositoryId: repo.id,
      author: c.commit.author?.name || 'Unknown',
      date: c.commit.author?.date || new Date(),
    }));

    // 5️⃣ Upsert commits into DB
    for (const c of commits) {
      await prisma.commit.upsert({
        where: { sha: c.sha },
        update: {},
        create: c,
      });
    }

    res.json(commits);

  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 403) {
      console.log(`⚠️ Repo "${repo?.name}" not accessible with token`);
      return res.status(403).json({ error: 'Repo not accessible with current token', repo: repo?.name });
    }
    console.error('❌ Error in /github/:repoId route:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});

module.exports = router;
