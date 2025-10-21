/*
  Warnings:

  - A unique constraint covering the columns `[sha]` on the table `Commit` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Commit" ADD COLUMN     "author" TEXT,
ADD COLUMN     "sha" TEXT;

-- AlterTable
ALTER TABLE "Repository" ADD COLUMN     "ownerName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Commit_sha_key" ON "Commit"("sha");
