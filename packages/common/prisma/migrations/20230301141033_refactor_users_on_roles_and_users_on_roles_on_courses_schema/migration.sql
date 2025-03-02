/*
  Warnings:

  - You are about to drop the column `user_email` on the `UsersOnRoles` table. All the data in the column will be lost.
  - You are about to drop the column `user_email` on the `UsersOnRolesOnCourses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `UsersOnRoles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,course_id]` on the table `UsersOnRolesOnCourses` will be added. If there are existing duplicate values, this will fail.
  - Made the column `user_id` on table `UsersOnRoles` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `UsersOnRolesOnCourses` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UsersOnRoles" DROP CONSTRAINT "UsersOnRoles_user_email_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnRolesOnCourses" DROP CONSTRAINT "UsersOnRolesOnCourses_user_email_fkey";

-- DropIndex
DROP INDEX "UsersOnRoles_user_email_key";

-- DropIndex
DROP INDEX "UsersOnRolesOnCourses_user_email_course_id_key";

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "UsersOnRoles" DROP COLUMN "user_email",
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "user_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UsersOnRolesOnCourses" DROP COLUMN "user_email",
ALTER COLUMN "user_id" SET NOT NULL,
ALTER COLUMN "user_id" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnRoles_user_id_key" ON "UsersOnRoles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnRolesOnCourses_user_id_course_id_key" ON "UsersOnRolesOnCourses"("user_id", "course_id");

-- AddForeignKey
ALTER TABLE "UsersOnRoles" ADD CONSTRAINT "UsersOnRoles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsersOnRolesOnCourses" ADD CONSTRAINT "UsersOnRolesOnCourses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
