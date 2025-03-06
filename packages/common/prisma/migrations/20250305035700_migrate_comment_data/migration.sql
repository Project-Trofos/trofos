/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.

*/

-- MigrateData
INSERT INTO "BaseComment" (comment_id, content, created_at, updated_at, type) SELECT comment_id, content, created_at, updated_at, 'backlog' FROM "Comment";
INSERT INTO "BacklogComment" (comment_id, backlog_id, commenter_id, project_id) SELECT comment_id, backlog_id, commenter_id, project_id FROM "Comment";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_backlog_id_project_id_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commenter_id_project_id_fkey";

-- DropTable
DROP TABLE "Comment";
