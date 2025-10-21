// add_all_repos.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// ⚡ Replace with your GitHub personal access token
const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

// Get ownerId dynamically from command line argument
const ownerId = parseInt(process.argv[2]);
if (!ownerId) {
  console.error("Usage: node add_all_repos.js <ownerId>");
  process.exit(1);
}

async function main() {
  try {
    // 1️⃣ Fetch all repos you have access to (owned + collaborated)
    const res = await axios.get('https://api.github.com/user/repos?per_page=100', {
      headers: {
        'User-Agent': 'SVCA-App',
        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
      },
    });

    const repos = res.data;
    console.log(`Found ${repos.length} repos accessible by this user`);

    for (const r of repos) {
      const repoName = r.name;
      const realOwner = r.owner.login;

      // 2️⃣ Check if repo already exists, then create or update
let repo = await prisma.repository.findFirst({ where: { name: repoName } });

if (repo) {
  // Update existing repo
  repo = await prisma.repository.update({
    where: { id: repo.id },
    data: { githubOwnerUsername: realOwner, ownerId }
  });
} else {
  // Create new repo
  repo = await prisma.repository.create({
    data: { name: repoName, githubOwnerUsername: realOwner, ownerId }
  });
}


      console.log(`✅ Repo added: ${repoName}, real owner: ${realOwner}`);

      // 3️⃣ Fetch commits
      const commitsRes = await axios.get(
        `https://api.github.com/repos/${realOwner}/${repoName}/commits`,
        {
          headers: {
            'User-Agent': 'SVCA-App',
            Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
          },
        }
      );

      const commits = commitsRes.data.map(c => ({
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

      console.log(`✅ ${commits.length} commits saved for ${repoName}`);
    }

    console.log('🎉 All repos added and commits fetched!');
  } catch (err) {
    console.error('❌ Error:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
