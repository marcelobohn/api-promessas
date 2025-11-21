-- Drop dependent table first
DROP TABLE IF EXISTS "cities";
DROP TABLE IF EXISTS "states";

-- Create states with codigo_uf as PK
CREATE TABLE "states" (
  "codigo_uf" INTEGER PRIMARY KEY,
  "name" TEXT NOT NULL,
  "abbreviation" TEXT NOT NULL UNIQUE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create cities referencing codigo_uf
CREATE TABLE "cities" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "state_code" INTEGER NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "cities_state_code_fkey" FOREIGN KEY ("state_code") REFERENCES "states" ("codigo_uf") ON DELETE CASCADE,
  CONSTRAINT "cities_name_state_code_key" UNIQUE ("name", "state_code")
);
