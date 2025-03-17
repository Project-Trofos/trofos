-- CreateEnum
CREATE TYPE "ApiMethodType" AS ENUM ('get', 'post', 'put', 'delete');

-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "method" "ApiMethodType" NOT NULL,
    "session_id" TEXT,
    "request_body" JSONB,
    "response_code" INTEGER NOT NULL,
    "response_time" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
