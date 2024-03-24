-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "StandUpNote" (
    "id" SERIAL NOT NULL,
    "column_id" INTEGER NOT NULL,
    "stand_up_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "StandUpNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StandUp" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StandUp_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StandUpNote" ADD CONSTRAINT "StandUpNote_stand_up_id_fkey" FOREIGN KEY ("stand_up_id") REFERENCES "StandUp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StandUp" ADD CONSTRAINT "StandUp_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
