BEGIN;
ALTER TABLE "ProjectGitLink"
  ADD COLUMN "installation_id" TEXT,
  ADD COLUMN "repository_id" TEXT,
  ADD COLUMN "connected_by" INTEGER,
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
COMMIT;
