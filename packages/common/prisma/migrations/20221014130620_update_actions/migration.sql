/*
  Warnings:

  - Added the required column `user_is_admin` to the `UserSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Action" ADD VALUE 'read_users';
ALTER TYPE "Action" ADD VALUE 'create_users';
ALTER TYPE "Action" ADD VALUE 'admin';

-- AlterTable
ALTER TABLE "UserSession" ADD COLUMN     "user_is_admin" BOOLEAN NOT NULL,
ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';
