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
  origin: 'http://localhost:5173', // frontend origin
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'svca-secret-key', // change to a strong secret
  resave: false,
  saveUninitialized: true
}));

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
  const redirect_uri = 'http://localhost:5000/auth/github/callback';
  const scope = 'repo read:user';
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${scope}`;
  res.redirect(githubAuthUrl);
});

// ---------- Test endpoint ----------
app.get('/', (req, res) => res.send('SVCA Backend Running ✅'));


// ---------- Start server ----------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
