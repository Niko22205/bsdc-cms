-- AlterTable
ALTER TABLE "ProjectNewsItem" ADD COLUMN IF NOT EXISTS "location" TEXT;
ALTER TABLE "ProjectNewsItem" ADD COLUMN IF NOT EXISTS "client" TEXT;
