-- AlterTable
ALTER TABLE "offices"
  ADD COLUMN "office_type" "ElectionType" NOT NULL DEFAULT 'FEDERAL_ESTADUAL';

-- Update existing offices to proper type
UPDATE "offices"
  SET "office_type" = 'MUNICIPAL'
  WHERE "name" IN ('Prefeito', 'Vereador');
