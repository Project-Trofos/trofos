-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "is_archive" BOOLEAN;

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
