-- CreateTable
CREATE TABLE "political_parties" (
    "id" SERIAL PRIMARY KEY,
    "acronym" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_acronym_key" ON "political_parties" ("acronym");
CREATE UNIQUE INDEX "political_parties_number_key" ON "political_parties" ("number");
