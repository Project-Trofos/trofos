-- AlterEnum
ALTER TYPE "SprintStatus" ADD VALUE 'closed';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
