-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
