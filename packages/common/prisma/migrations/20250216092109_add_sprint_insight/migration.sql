-- CreateTable
CREATE TABLE "SprintInsight" (
    "id" SERIAL NOT NULL,
    "sprint_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SprintInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SprintInsight_sprint_id_category_key" ON "SprintInsight"("sprint_id", "category");

-- AddForeignKey
ALTER TABLE "SprintInsight" ADD CONSTRAINT "SprintInsight_sprint_id_fkey" FOREIGN KEY ("sprint_id") REFERENCES "Sprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
