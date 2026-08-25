-- CreateEnum
CREATE TYPE "ProjectGradeStatus" AS ENUM ('draft', 'submitted', 'published');

-- AlterEnum
ALTER TYPE "Action" ADD VALUE 'read_grade';
ALTER TYPE "Action" ADD VALUE 'update_grade';
ALTER TYPE "Action" ADD VALUE 'publish_grade';

-- CreateTable
CREATE TABLE "ProjectGrade" (
    "id" SERIAL NOT NULL,
    "project_id" INTEGER NOT NULL,
    "assigned_ta_id" INTEGER,
    "marks" DECIMAL(5,2),
    "comments" TEXT,
    "status" "ProjectGradeStatus" NOT NULL DEFAULT 'draft',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectGrade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectGrade_project_id_key" ON "ProjectGrade"("project_id");

-- AddForeignKey
ALTER TABLE "ProjectGrade" ADD CONSTRAINT "ProjectGrade_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectGrade" ADD CONSTRAINT "ProjectGrade_assigned_ta_id_fkey" FOREIGN KEY ("assigned_ta_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
