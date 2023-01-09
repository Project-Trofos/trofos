-- CreateEnum
CREATE TYPE "HistoryType" AS ENUM ('create', 'update', 'delete');

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "BacklogHistory" (
    "project_id" INTEGER NOT NULL,
    "backlog_id" INTEGER NOT NULL,
    "sprint_id" INTEGER,
    "history_type" "HistoryType" NOT NULL,
    "type" "BacklogType",
    "priority" "BacklogPriority",
    "summary" TEXT NOT NULL,
    "reporter_id" INTEGER NOT NULL,
    "assignee_id" INTEGER,
    "points" INTEGER,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BacklogHistory_pkey" PRIMARY KEY ("project_id","backlog_id","date")
);

-- AddForeignKey
ALTER TABLE "BacklogHistory" ADD CONSTRAINT "BacklogHistory_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklogHistory" ADD CONSTRAINT "BacklogHistory_project_id_status_fkey" FOREIGN KEY ("project_id", "status") REFERENCES "BacklogStatus"("project_id", "name") ON DELETE CASCADE ON UPDATE CASCADE;
