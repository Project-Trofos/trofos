/*
  Warnings:

  - A unique constraint covering the columns `[issue_id]` on the table `Backlog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "IssueStatusType" AS ENUM ('open', 'valid', 'invalid', 'unable_to_replicate');

-- AlterTable
ALTER TABLE "Backlog" ADD COLUMN     "issue_id" INTEGER;

-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "Issue" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "IssueStatusType" NOT NULL DEFAULT 'open',
    "status_explanation" TEXT,
    "priority" "BacklogPriority",
    "reporter_id" INTEGER NOT NULL,
    "assigner_project_id" INTEGER NOT NULL,
    "assignee_project_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Backlog_issue_id_key" ON "Backlog"("issue_id");

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "Issue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_reporter_id_assigner_project_id_fkey" FOREIGN KEY ("reporter_id", "assigner_project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assigner_project_id_fkey" FOREIGN KEY ("assigner_project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_assignee_project_id_fkey" FOREIGN KEY ("assignee_project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
