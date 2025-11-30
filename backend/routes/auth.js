const express = require('express');
const router = express.Router();
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken'); // <-- added
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Step 1: Redirect user to GitHub login
router.get('/github', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const redirect_uri = process.env.GITHUB_REDIRECT_URI;
  const scope = 'repo read:user';
  const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
  res.redirect(url);
});

// Step 2: Callback
router.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  console.log('Received code:', code);

  try {
    const tokenRes = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    console.log('Token Response:', tokenRes.data);

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) return res.status(500).send('GitHub OAuth failed: no access token');

    const userRes = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${accessToken}` }
    });

    console.log('GitHub User:', userRes.data);

    // Upsert user in DB
    const user = await prisma.user.upsert({
      where: { username: userRes.data.login },
      update: { accessToken, githubId: userRes.data.id.toString() },
      create: {
        username: userRes.data.login,
        email: userRes.data.email || '',
        githubId: userRes.data.id.toString(),
        accessToken
      }
    });

    // Generate JWT (no expiry)
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    // Redirect to frontend with token
    res.redirect(
      `${FRONTEND_URL}/auth/github/callback?jwt=${token}&accessToken=${accessToken}`
    );
  } catch (err) {
    console.error('OAuth Error:', err.response ? err.response.data : err.message);
    res.status(500).send('GitHub OAuth failed');
  }
});

module.exports = router;
