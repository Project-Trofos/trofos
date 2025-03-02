-- CreateEnum
CREATE TYPE "BacklogStatus" AS ENUM ('todo', 'in_progress', 'done');

-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('upcoming', 'current', 'completed');

-- AlterTable
ALTER TABLE "Backlog" ADD COLUMN     "status" "BacklogStatus" NOT NULL DEFAULT 'todo';

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "status" "SprintStatus" NOT NULL DEFAULT 'upcoming';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
