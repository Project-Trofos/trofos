-- CreateEnum
CREATE TYPE "Feature" AS ENUM ('user_guide_copilot');

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" SERIAL NOT NULL,
    "feature_name" "Feature" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_feature_name_key" ON "FeatureFlag"("feature_name");
