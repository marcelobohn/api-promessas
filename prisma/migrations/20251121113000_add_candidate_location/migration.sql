ALTER TABLE "candidates"
  ADD COLUMN "state_code" INTEGER,
  ADD COLUMN "city_id" INTEGER,
  ADD CONSTRAINT "candidates_state_code_fkey" FOREIGN KEY ("state_code") REFERENCES "states"("codigo_uf") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "candidates_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
