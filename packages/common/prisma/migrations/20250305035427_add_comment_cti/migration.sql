
-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('backlog', 'issue');

-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "BaseComment" (
    "comment_id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "type" "CommentType" NOT NULL,

    CONSTRAINT "BaseComment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "BacklogComment" (
    "comment_id" INTEGER NOT NULL,
    "backlog_id" INTEGER NOT NULL,
    "commenter_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,

    CONSTRAINT "BacklogComment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "IssueComment" (
    "comment_id" INTEGER NOT NULL,
    "issue_id" INTEGER NOT NULL,
    "commenter_id" INTEGER NOT NULL,

    CONSTRAINT "IssueComment_pkey" PRIMARY KEY ("comment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BacklogComment_comment_id_key" ON "BacklogComment"("comment_id");

-- CreateIndex
CREATE UNIQUE INDEX "IssueComment_comment_id_key" ON "IssueComment"("comment_id");

-- AddForeignKey
ALTER TABLE "BacklogComment" ADD CONSTRAINT "BacklogComment_backlog_id_project_id_fkey" FOREIGN KEY ("backlog_id", "project_id") REFERENCES "Backlog"("backlog_id", "project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklogComment" ADD CONSTRAINT "BacklogComment_commenter_id_project_id_fkey" FOREIGN KEY ("commenter_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklogComment" ADD CONSTRAINT "BacklogComment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "BaseComment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "Issue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_commenter_id_fkey" FOREIGN KEY ("commenter_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueComment" ADD CONSTRAINT "IssueComment_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "BaseComment"("comment_id") ON DELETE CASCADE ON UPDATE CASCADE;
