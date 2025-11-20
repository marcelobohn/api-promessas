-- CreateEnum
CREATE TYPE "PromiseStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "promises"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "PromiseStatus" USING "status"::text::"PromiseStatus",
  ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
