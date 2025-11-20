-- Add column for party relation
ALTER TABLE "candidates" ADD COLUMN "political_party_id" INTEGER;

-- Backfill not possible (old column removed); if needed, manual mapping should be applied before dropping the old column.

-- Drop old text column
ALTER TABLE "candidates" DROP COLUMN IF EXISTS "political_party";

-- Add FK
ALTER TABLE "candidates"
  ADD CONSTRAINT "candidates_political_party_id_fkey" FOREIGN KEY ("political_party_id")
  REFERENCES "political_parties" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add unique index only if needed? (none)
