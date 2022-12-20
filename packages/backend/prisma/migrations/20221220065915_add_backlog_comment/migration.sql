-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "Comment" (
    "comment_id" SERIAL NOT NULL,
    "backlog_id" INTEGER NOT NULL,
    "commenter_id" INTEGER NOT NULL,
    "project_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("comment_id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_backlog_id_project_id_fkey" FOREIGN KEY ("backlog_id", "project_id") REFERENCES "Backlog"("backlog_id", "project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commenter_id_project_id_fkey" FOREIGN KEY ("commenter_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE RESTRICT ON UPDATE CASCADE;
