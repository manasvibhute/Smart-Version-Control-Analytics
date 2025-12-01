const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');


// ✅ GET all commits
router.get('/', async (req, res) => {
  try {
    const commits = await prisma.commit.findMany({
      include: { repository: true },
    });
    res.json(commits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST manual commit
router.post('/', async (req, res) => {
  const { message, repositoryId } = req.body;
  try {
    const newCommit = await prisma.commit.create({
      data: { message, repositoryId },
    });
    res.json(newCommit);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// 🔧 GET commits from GitHub using accessToken and repo name
router.get('/github', async (req, res) => {
  const { accessToken, repo } = req.query;

  if (!accessToken || !repo) {
    return res.status(400).json({ error: 'Missing accessToken or repo' });
  }

  try {
    const url = `https://api.github.com/repos/${repo}/commits`;
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const commits = response.data.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author?.name || 'Unknown',
      date: c.commit.author?.date || new Date(),
      stats: c.stats || {},
    }));

    res.json({ commits });
  } catch (err) {
    console.error('❌ GitHub fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch commits from GitHub' });
  }
});

// ✅ Fetch commits directly from GitHub API and save
router.post('/github/:repoId', async (req, res) => {
  const { repoId } = req.params;

  try {
    const repo = await prisma.repository.findUnique({
      where: { id: parseInt(repoId) },
    });

    if (!repo) return res.status(400).json({ error: 'Repository not found' });

    const url = `https://api.github.com/repos/${repo.ownerName}/${repo.name}/commits`;
    console.log('Fetching commits from:', url);

    // For public repos, you can fetch without token:
    const response = await axios.get(url);

    const commits = response.data.map(c => ({
      sha: c.sha,
      message: c.commit.message,
      repositoryId: repo.id,
      author: c.commit.author?.name || 'Unknown',
      date: c.commit.author?.date || new Date(),
    }));

    for (const c of commits) {
      await prisma.commit.upsert({
        where: { sha: c.sha },
        update: {},
        create: c,
      });
    }

    console.log(`✅ ${commits.length} commits saved for repo: ${repo.name}`);
    res.json(commits);
  } catch (err) {
    console.error('❌ Error fetching commits:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to fetch commits' });
  }
});


module.exports = router;
