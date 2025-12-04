// add_all_repos.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

async function addAllRepos(ownerId, accessToken) {
  console.log("🚀 addAllRepos() STARTED for owner:", ownerId);

  try {
    const res = await axios.get(
      "https://api.github.com/user/repos?per_page=100",
      {
        headers: {
          "User-Agent": "SVCA-App",
          Authorization: `token ${accessToken}`,
        },
      }
    );

    const repos = res.data;
    console.log("📁 Found repos:", repos.length);

    for (const r of repos) {
      const repoName = r.name;
      const realOwner = r.owner.login;

      console.log("➡️ Processing repo:", repoName);

      let repo = await prisma.repository.findFirst({
        where: { name: repoName },
      });

      if (repo) {
        console.log("🔄 Repo exists, updating:", repoName);
        repo = await prisma.repository.update({
          where: { id: repo.id },
          data: { githubOwnerUsername: realOwner, ownerId },
        });
      } else {
        console.log("✨ Creating new repo:", repoName);
        repo = await prisma.repository.create({
          data: {
            name: repoName,
            githubOwnerUsername: realOwner,
            ownerId,
          },
        });
      }

      // Fetch commits
      console.log("📨 Fetching commits for:", repoName);

      const commitsRes = await axios.get(
        `https://api.github.com/repos/${realOwner}/${repoName}/commits`,
        {
          headers: {
            "User-Agent": "SVCA-App",
            Authorization: `token ${accessToken}`,
          },
        }
      );

      console.log(`📝 Found ${commitsRes.data.length} commits for ${repoName}`);

      const commits = commitsRes.data.map((c) => ({
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

      console.log(`✅ Saved commits for ${repoName}`);
    }

    console.log("🎉 addAllRepos() COMPLETED");
    return true;

  } catch (err) {
    console.error("❌ addAllRepos error:", err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
    console.log("🔌 Prisma disconnected");
  }
}

module.exports = addAllRepos;
