/*
  Warnings:

  - Added the required column `user_id` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "user_id" INTEGER NOT NULL,
ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
