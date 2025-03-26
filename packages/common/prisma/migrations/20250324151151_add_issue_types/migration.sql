-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('bug', 'enhancement', 'task');

-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week';

-- AlterTable
ALTER TABLE "Issue" ADD COLUMN     "type" "IssueType" NOT NULL DEFAULT 'bug';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
