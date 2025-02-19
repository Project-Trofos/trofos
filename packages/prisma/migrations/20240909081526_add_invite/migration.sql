-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "Invite" (
    "project_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "unique_token" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL DEFAULT NOW() + interval '1 week',

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("project_id","email")
);
