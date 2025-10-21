const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// GET all PRs
router.get('/', async (req, res) => {
    try {
        const prs = await prisma.pullRequest.findMany({
            include: { repository: true },
        });
        res.json(prs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST new PR
router.post('/', async (req, res) => {
    const { title, status, repositoryId } = req.body;
    try {
        const newPR = await prisma.pullRequest.create({
            data: { title, status, repositoryId },
        });
        res.json(newPR);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/github/:repoId', async (req, res) => {
  const { repoId } = req.params;
  try {
    const repo = await prisma.repository.findUnique({
      where: { id: parseInt(repoId) },
      include: { owner: true }
    });

    if (!repo || !repo.owner.accessToken) return res.status(400).json({ error: 'No GitHub token' });

    const response = await axios.get(`https://api.github.com/repos/${repo.owner.username}/${repo.name}/pulls?state=all`, {
      headers: { Authorization: `token ${repo.owner.accessToken}` }
    });

    const prs = response.data.map(pr => ({
      githubId: pr.id.toString(),
      title: pr.title,
      status: pr.state,
      repositoryId: repo.id,
      createdAt: pr.created_at,
      mergedAt: pr.merged_at
    }));

    for (let p of prs) {
      await prisma.pullRequest.upsert({
        where: { githubId: p.githubId },
        update: {},
        create: p
      });
    }

    res.json(prs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pull requests' });
  }
});

module.exports = router;
