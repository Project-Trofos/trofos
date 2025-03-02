-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- AlterTable
ALTER TABLE "UsersOnRoles" ADD COLUMN     "user_id" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "UsersOnRolesOnCourses" ADD COLUMN     "user_id" INTEGER DEFAULT 0;
