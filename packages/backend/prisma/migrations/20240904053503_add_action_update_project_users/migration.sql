-- The below are for the next migration as prisma has issues
-- inserting in one table then another that references it

-- AlterEnum
ALTER TYPE "Action" ADD VALUE 'update_project_users';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- Insert for shadow db. In real db (production), this is ignored as it was
-- already seeded initially. In fresh db, this is inserted, then the seed script
-- is ignored
-- This is needed for the subsequent migration that has fk to this. Shadow db ignores seeding
-- so this needs to be done here
INSERT INTO "Role" (id, role_name)
VALUES (1, 'FACULTY')
ON CONFLICT (id) DO NOTHING;