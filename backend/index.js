// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://smart-version-control-analytics-9d5t.onrender.com'
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

const githubRoute = require("./routes/github");
app.use("/github", githubRoute);

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

  try {
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id,
        client_secret,
        code
      },
      { headers: { Accept: 'application/json' } }
    );

    const access_token = tokenResponse.data.access_token;
    console.log("GitHub Access Token:", access_token);

    if (!access_token) {
      console.log("❌ No access token returned");
      return res.status(400).json({ error: "No access token" });
    }

    const frontend = process.env.FRONTEND_URL;
    return res.redirect(`${frontend}/dashboard?token=${access_token}`);

  } catch (error) {
    console.error("❌ GitHub OAuth Callback Error:", error.response?.data || error);
    return res.status(500).json({ error: "GitHub OAuth failed" });
  }
});

// ---------- Test endpoint ----------
app.get('/', (req, res) => res.send('SVCA Backend Running ✅'));


// ---------- Start server ----------
app.listen(PORT, () => console.log(`SVCA + ML backend running on port ${PORT}`));

