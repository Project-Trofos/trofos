/*
  Warnings:

  - A unique constraint covering the columns `[user_email,course_id]` on the table `UsersOnRolesOnCourses` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "UsersOnRolesOnCourses_user_email_key";

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnRolesOnCourses_user_email_course_id_key" ON "UsersOnRolesOnCourses"("user_email", "course_id");
