/*
  Warnings:

  - You are about to drop the column `ownerName` on the `Repository` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Repository_name_ownerId_key";

-- AlterTable
ALTER TABLE "Repository" DROP COLUMN "ownerName",
ADD COLUMN     "githubOwnerUsername" TEXT;
