-- DropForeignKey
ALTER TABLE "Announcement" DROP CONSTRAINT "Announcement_user_id_course_id_fkey";

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_user_id_course_id_fkey" FOREIGN KEY ("user_id", "course_id") REFERENCES "UsersOnRolesOnCourses"("user_id", "course_id") ON DELETE RESTRICT ON UPDATE CASCADE;
