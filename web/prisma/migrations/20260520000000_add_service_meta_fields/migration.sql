-- AlterTable: add service display metadata fields
ALTER TABLE "Service" ADD COLUMN "accentColor" TEXT;
ALTER TABLE "Service" ADD COLUMN "bgColor"     TEXT;
ALTER TABLE "Service" ADD COLUMN "activities"  TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Service" ADD COLUMN "statCards"   JSONB;
