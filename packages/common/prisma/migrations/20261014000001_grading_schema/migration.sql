-- CreateEnum
CREATE TYPE "GradeStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "GradeAuditAction" AS ENUM ('MILESTONE_GRADE_UPSERTED', 'MILESTONE_GRADE_PUBLISHED', 'MILESTONE_GRADE_UNPUBLISHED', 'MILESTONE_GRADE_DELETED', 'MILESTONE_MAX_MARKS_UPDATED', 'TA_ASSIGNED', 'SPRINT_GRADE_UPSERTED', 'SPRINT_GRADE_PUBLISHED', 'SPRINT_GRADE_UNPUBLISHED', 'SPRINT_GRADE_DELETED', 'SPRINT_MAX_MARKS_UPDATED', 'SPRINT_TA_ASSIGNED');

-- AlterEnum
ALTER TYPE "Action" ADD VALUE 'create_grade';
ALTER TYPE "Action" ADD VALUE 'read_grade';
ALTER TYPE "Action" ADD VALUE 'update_grade';
ALTER TYPE "Action" ADD VALUE 'delete_grade';

-- AlterEnum
ALTER TYPE "Feature" ADD VALUE 'manual_grading';

-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN "max_marks" DOUBLE PRECISION NOT NULL DEFAULT 100;

-- AlterTable
ALTER TABLE "Sprint" ADD COLUMN "max_marks" DOUBLE PRECISION;

-- Unrelated schema drift carried over from history (originally bundled into
-- add_grade_audit_log) — kept here so squashing these migrations doesn't lose it.
ALTER TABLE "Invite" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week';
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "milestone_id" INTEGER,
    "sprint_id" INTEGER,
    "score" DOUBLE PRECISION,
    "comment" TEXT,
    "status" "GradeStatus" NOT NULL DEFAULT 'DRAFT',
    "grader_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeAuditLog" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "milestone_id" INTEGER,
    "sprint_id" INTEGER,
    "score" DOUBLE PRECISION,
    "assigned_ta_id" INTEGER,
    "action" "GradeAuditAction" NOT NULL,
    "comment" TEXT,
    "status" "GradeStatus",
    "actor_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Grade_project_id_milestone_id_key" ON "Grade"("project_id", "milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_project_id_sprint_id_key" ON "Grade"("project_id", "sprint_id");

-- CreateIndex
CREATE INDEX "GradeAuditLog_project_id_created_at_idx" ON "GradeAuditLog"("project_id", "created_at");

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_grader_id_fkey" FOREIGN KEY ("grader_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeAuditLog" ADD CONSTRAINT "GradeAuditLog_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeAuditLog" ADD CONSTRAINT "GradeAuditLog_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeAuditLog" ADD CONSTRAINT "GradeAuditLog_assigned_ta_id_fkey" FOREIGN KEY ("assigned_ta_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeAuditLog" ADD CONSTRAINT "GradeAuditLog_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradeAuditLog" ADD CONSTRAINT "GradeAuditLog_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CheckConstraint: a Grade row targets exactly one of a milestone or a sprint.
ALTER TABLE "Grade" ADD CONSTRAINT "Grade_exactly_one_target_check"
  CHECK (
    (milestone_id IS NOT NULL AND sprint_id IS NULL)
    OR (milestone_id IS NULL AND sprint_id IS NOT NULL)
  );
