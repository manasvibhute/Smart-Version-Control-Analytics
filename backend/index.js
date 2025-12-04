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


// ---------- Test endpoint ----------
app.get('/', (req, res) => res.send('SVCA Backend Running ✅'));


// ---------- Start server ----------
app.listen(PORT, () => console.log(`SVCA + ML backend running on port ${PORT}`));

