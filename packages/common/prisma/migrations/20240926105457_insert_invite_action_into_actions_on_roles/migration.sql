-- AlterTable
ALTER TABLE "Invite" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + interval '1 week';

-- AlterTable
ALTER TABLE "UserSession" ALTER COLUMN "session_expiry" SET DEFAULT NOW() + interval '1 day';

-- Insert into ActionsOnRoles
INSERT INTO "ActionsOnRoles" (role_id, action)
VALUES (1, 'send_invite');