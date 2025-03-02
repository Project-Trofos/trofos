-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "UsersOnProjectOnSettings" (
    "project_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email_notification" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UsersOnProjectOnSettings_pkey" PRIMARY KEY ("project_id","user_id")
);

-- AddForeignKey
ALTER TABLE "UsersOnProjectOnSettings" ADD CONSTRAINT "UsersOnProjectOnSettings_project_id_user_id_fkey" FOREIGN KEY ("project_id", "user_id") REFERENCES "UsersOnProjects"("project_id", "user_id") ON DELETE CASCADE ON UPDATE CASCADE;
