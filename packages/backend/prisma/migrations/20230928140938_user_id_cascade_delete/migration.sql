-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_user_id_course_id_fkey";

-- DropForeignKey
ALTER TABLE "Backlog" DROP CONSTRAINT "Backlog_assignee_id_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Backlog" DROP CONSTRAINT "Backlog_reporter_id_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commenter_id_project_id_fkey";

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_user_id_course_id_fkey" FOREIGN KEY ("user_id", "course_id") REFERENCES "UsersOnRolesOnCourses"("user_id", "course_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_reporter_id_project_id_fkey" FOREIGN KEY ("reporter_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_assignee_id_project_id_fkey" FOREIGN KEY ("assignee_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commenter_id_project_id_fkey" FOREIGN KEY ("commenter_id", "project_id") REFERENCES "UsersOnProjects"("user_id", "project_id") ON DELETE CASCADE ON UPDATE CASCADE;
