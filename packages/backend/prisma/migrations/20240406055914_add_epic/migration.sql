-- AlterTable
ALTER TABLE "Backlog" ADD COLUMN     "epic_id" INTEGER;

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "Epic" (
    "epic_id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Epic_pkey" PRIMARY KEY ("epic_id")
);

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_epic_id_fkey" FOREIGN KEY ("epic_id") REFERENCES "Epic"("epic_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Epic" ADD CONSTRAINT "Epic_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
