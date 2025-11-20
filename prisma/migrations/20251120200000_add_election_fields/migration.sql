-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('FEDERAL_ESTADUAL', 'MUNICIPAL');

-- AlterTable
ALTER TABLE "elections"
  ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "election_type" "ElectionType" NOT NULL DEFAULT 'FEDERAL_ESTADUAL';

-- Align existing records from previous seeds
UPDATE "elections" SET "election_type" = 'MUNICIPAL' WHERE "year" = 2028;
