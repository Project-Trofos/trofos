/*
  Warnings:

  - The primary key for the `Invite` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `Invite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[unique_token]` on the table `Invite` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "Feature" ADD VALUE 'project_invite_links';

-- AlterTable
DELETE FROM "Invite";
ALTER TABLE "Invite" DROP CONSTRAINT "Invite_pkey",
DROP COLUMN "email",
ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week',
ADD CONSTRAINT "Invite_pkey" PRIMARY KEY ("project_id");

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateIndex
CREATE UNIQUE INDEX "Invite_unique_token_key" ON "Invite"("unique_token");

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
