-- CreateEnum
CREATE TYPE "RetrospectiveType" AS ENUM ('positive', 'negative', 'action');

-- CreateEnum
CREATE TYPE "RetrospectiveVoteType" AS ENUM ('up', 'down');

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "Retrospective" (
    "id" SERIAL NOT NULL,
    "sprint_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "type" "RetrospectiveType" NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Retrospective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RetrospectiveVote" (
    "retro_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "RetrospectiveVoteType" NOT NULL,

    CONSTRAINT "RetrospectiveVote_pkey" PRIMARY KEY ("retro_id","user_id")
);

-- AddForeignKey
ALTER TABLE "Retrospective" ADD CONSTRAINT "Retrospective_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RetrospectiveVote" ADD CONSTRAINT "RetrospectiveVote_retro_id_fkey" FOREIGN KEY ("retro_id") REFERENCES "Retrospective"("id") ON DELETE CASCADE ON UPDATE CASCADE;
