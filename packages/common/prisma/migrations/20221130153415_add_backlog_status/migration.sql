/*
  Warnings:

  - Changed the type of `status` on the `Backlog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "BacklogStatusType" AS ENUM ('todo', 'in_progress', 'done');

-- AlterTable
ALTER TABLE "Backlog" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- DropEnum
DROP TYPE "BacklogStatus";

-- CreateTable
CREATE TABLE "BacklogStatus" (
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "BacklogStatusType" NOT NULL DEFAULT 'in_progress',
    "order" INTEGER NOT NULL,

    CONSTRAINT "BacklogStatus_pkey" PRIMARY KEY ("project_id","name")
);

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_project_id_status_fkey" FOREIGN KEY ("project_id", "status") REFERENCES "BacklogStatus"("project_id", "name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BacklogStatus" ADD CONSTRAINT "BacklogStatus_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
