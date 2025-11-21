/*
  Warnings:

  - Made the column `ibge_code` on table `cities` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "cities" DROP CONSTRAINT "cities_state_code_fkey";

-- AlterTable
ALTER TABLE "cities" ALTER COLUMN "ibge_code" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_code_fkey" FOREIGN KEY ("state_code") REFERENCES "states"("codigo_uf") ON DELETE CASCADE ON UPDATE CASCADE;
