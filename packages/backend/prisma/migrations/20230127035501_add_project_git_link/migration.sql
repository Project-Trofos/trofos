-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "ProjectGitLink" (
    "project_id" INTEGER NOT NULL,
    "repo" TEXT NOT NULL,

    CONSTRAINT "ProjectGitLink_pkey" PRIMARY KEY ("project_id")
);

-- AddForeignKey
ALTER TABLE "ProjectGitLink" ADD CONSTRAINT "ProjectGitLink_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
