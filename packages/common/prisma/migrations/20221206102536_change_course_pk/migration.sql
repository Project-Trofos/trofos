/*
  Warnings:

  - The primary key for the `Course` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `sem` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `Course` table. All the data in the column will be lost.
  - The `id` column on the `Course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `course_sem` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `course_year` on the `Project` table. All the data in the column will be lost.
  - The `course_id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UsersOnCourses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `course_sem` on the `UsersOnCourses` table. All the data in the column will be lost.
  - You are about to drop the column `course_year` on the `UsersOnCourses` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,startYear,startSem]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `Course` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `endSem` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endYear` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startSem` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startYear` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `course_id` on the `UsersOnCourses` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_course_id_course_year_course_sem_fkey";

-- DropForeignKey
ALTER TABLE "UsersOnCourses" DROP CONSTRAINT "UsersOnCourses_course_id_course_year_course_sem_fkey";

-- AlterTable
ALTER TABLE "Course" DROP CONSTRAINT "Course_pkey",
DROP COLUMN "sem",
DROP COLUMN "year",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "endSem" INTEGER NOT NULL,
ADD COLUMN     "endYear" INTEGER NOT NULL,
ADD COLUMN     "startSem" INTEGER NOT NULL,
ADD COLUMN     "startYear" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Course_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "course_sem",
DROP COLUMN "course_year",
DROP COLUMN "course_id",
ADD COLUMN     "course_id" INTEGER;

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "UsersOnCourses" DROP CONSTRAINT "UsersOnCourses_pkey",
DROP COLUMN "course_sem",
DROP COLUMN "course_year",
DROP COLUMN "course_id",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD CONSTRAINT "UsersOnCourses_pkey" PRIMARY KEY ("course_id", "user_id");

-- CreateTable
CREATE TABLE "Settings" (
    "id" SERIAL NOT NULL,
    "current_year" INTEGER NOT NULL,
    "current_sem" INTEGER NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_startYear_startSem_key" ON "Course"("code", "startYear", "startSem");

-- AddForeignKey
ALTER TABLE "UsersOnCourses" ADD CONSTRAINT "UsersOnCourses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
