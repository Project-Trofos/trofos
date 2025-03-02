/*
  Warnings:

  - Added the required column `duration` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Sprint` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `Sprint` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
CREATE SEQUENCE "sprint_id_seq";
ALTER TABLE "Sprint" ADD COLUMN     "duration" INTEGER NOT NULL,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "goals" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "project_id" INTEGER NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3),
ALTER COLUMN "id" SET DEFAULT nextval('sprint_id_seq');
ALTER SEQUENCE "sprint_id_seq" OWNED BY "Sprint"."id";

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
