/*
  Warnings:

  - Made the column `course_id` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_course_id_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "shadow_course" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "course_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
