-- Add IBGE code to cities
ALTER TABLE "cities"
  ADD COLUMN "ibge_code" INTEGER,
  ADD CONSTRAINT "cities_ibge_code_key" UNIQUE ("ibge_code");
