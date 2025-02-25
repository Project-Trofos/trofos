-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "UserApiKey" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "api_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserApiKey_user_id_key" ON "UserApiKey"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserApiKey_api_key_key" ON "UserApiKey"("api_key");

-- AddForeignKey
ALTER TABLE "UserApiKey" ADD CONSTRAINT "UserApiKey_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add permissions
ALTER TYPE "Action" ADD VALUE 'create_api_key';
ALTER TYPE "Action" ADD VALUE 'read_api_key';