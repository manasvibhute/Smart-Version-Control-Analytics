// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
// Prisma + sync script imports
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const addAllRepos = require('./add_all_repos');   // <– YOU MUST EXPORT FUNCTION

// ---------- Middleware ----------
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://smart-version-control-analytics-9d5t.onrender.com', // frontend
    'https://smart-version-control-analytics.onrender.com'       // backend
  ],
  credentials: true
}));

app.use(express.json());
app.use(session({
  secret: 'svca-secret-key', // change to a strong secret
  resave: false,
  saveUninitialized: true
}));
// ✅ Add this logger here
app.use((req, res, next) => {
  console.log(`🔍 Incoming request: ${req.method} ${req.url}`);
  next();
});

const issuesRouter = require('./routes/issues');
const alertsRouter = require('./routes/alerts');

app.use('/issues', issuesRouter);
app.use('/alerts', alertsRouter);

const riskRoutes = require("./routes/risk");
app.use("/", riskRoutes);
// ---------- Import existing routes ----------
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const repoRoutes = require('./routes/repos');
app.use('/repos', repoRoutes);

const commitRoutes = require('./routes/commits');
app.use('/commits', commitRoutes);

const prRoutes = require('./routes/pull_requests');
app.use('/pull_requests', prRoutes);

const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// ---------- GitHub OAuth Routes ----------

// Step 1: Redirect user to GitHub login
app.get('/auth/github', (req, res) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const redirect_uri = process.env.GITHUB_REDIRECT_URI;
  const scope = 'repo read:user';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
  res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', async (req, res) => {
  const code = req.query.code;
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  console.log("🔁 GitHub redirected back with code:", code);

  if (!code) return res.status(400).send("No code from GitHub");

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      { client_id, client_secret, code },
      {
        headers: { Accept: "application/json", "User-Agent": "SVCA-App" }
      }
    );

    const access_token = tokenResponse.data.access_token;
    if (!access_token) return res.status(400).send("No access token");

    console.log("🔑 Access Token:", access_token);

    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${access_token}` }
    });

    const ghUser = userRes.data;

    let user = await prisma.user.upsert({
      where: { githubId: ghUser.id },
      update: {
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        accessToken: access_token
      },
      create: {
        githubId: ghUser.id,
        username: ghUser.login,
        avatarUrl: ghUser.avatar_url,
        accessToken: access_token
      }
    });

    console.log("👤 User saved:", user);

    console.log("🚀 Syncing GitHub Repos + Commits…");
    await addAllRepos(user.id, access_token);
    console.log("✅ Sync complete");

    const frontend = process.env.FRONTEND_URL;
    return res.redirect(`${frontend}/dashboard?userId=${user.id}`);

  } catch (error) {
    console.error("❌ OAuth Callback Error:", error.response?.data || error);
    return res.status(500).send("GitHub OAuth failed");
  }
});


// ---------- Test endpoint ----------
app.get('/', (req, res) => res.send('SVCA Backend Running ✅'));


// ---------- Start server ----------
app.listen(PORT, () => console.log(`SVCA + ML backend running on port ${PORT}`));

