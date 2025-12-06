const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken'); // <-- added
const prisma = new PrismaClient();
const addAllRepos = require('../add_all_repos');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


// Manual sync route
router.post('/sync-repos', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const userId = decoded.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.accessToken) {
      return res.status(404).json({ error: 'User not found or missing access token' });
    }

    await addAllRepos(prisma, user.id, user.accessToken);
    res.json({ message: 'Repo sync triggered successfully' });
  } catch (err) {
    console.error('❌ Manual sync error:', err.message);
    res.status(500).json({ error: 'Failed to sync repos' });
  }
});


// Step 1: Redirect user to GitHub login
router.get('/github', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const redirect_uri = process.env.GITHUB_REDIRECT_URI;
  const scope = 'repo read:user';
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
  res.redirect(url);
});

router.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error('No code received in callback');
    return res.status(400).send('Missing code');
  }

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI
      },
      { headers: { Accept: 'application/json' } }
    );

    console.log('GitHub token response:', tokenRes.data);

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      console.error('No access token received:', tokenRes.data);
      return res.status(500).send('GitHub OAuth failed: no access token');
    }

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });

    const user = await prisma.user.upsert({
      where: { githubId: userRes.data.id.toString() }, // safer if githubId is unique
      update: { accessToken },
      create: {
        username: userRes.data.login,
        email: userRes.data.email || '',
        githubId: userRes.data.id.toString(),
        accessToken
      }
    });

    addAllRepos(prisma, user.id, accessToken).catch(err => {
      console.error("Repo sync failed:", err);
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.redirect(`${FRONTEND_URL}/auth/github/callback?jwt=${token}&accessToken=${accessToken}`);
  } catch (err) {
    console.error('OAuth Error:', err.response ? err.response.data : err.message);
    res.status(500).send('GitHub OAuth failed');
  }
});

module.exports = router;
