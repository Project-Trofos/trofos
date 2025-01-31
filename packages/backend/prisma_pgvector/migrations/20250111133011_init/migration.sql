-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateTable
CREATE TABLE "UserGuideEmbedding" (
    "id" SERIAL NOT NULL,
    "embedding" vector(1536),
    "section_title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,

    CONSTRAINT "UserGuideEmbedding_pkey" PRIMARY KEY ("id")
);
