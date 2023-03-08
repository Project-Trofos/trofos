/*
  Warnings:

  - You are about to drop the `UsersOnCourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsersOnCourses" DROP CONSTRAINT "UsersOnCourses_course_id_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnCourses" DROP CONSTRAINT "UsersOnCourses_user_id_fkey";

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- DropTable
DROP TABLE "UsersOnCourses";
