-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- Insert into ActionsOnRoles
INSERT INTO "ActionsOnRoles" (role_id, action)
VALUES (1, 'create_api_key'),
(1, 'read_api_key');