-- Add the user who created each reusable project invite link.
ALTER TABLE "Invite" ADD COLUMN "inviter_id" INTEGER;

-- Existing links predate inviter tracking. Use the project owner where possible.
UPDATE "Invite"
SET "inviter_id" = "Project"."owner_id"
FROM "Project"
WHERE "Invite"."project_id" = "Project"."id";

-- Ownerless legacy links cannot be attributed accurately and must be regenerated.
DELETE FROM "Invite" WHERE "inviter_id" IS NULL;

ALTER TABLE "Invite" ALTER COLUMN "inviter_id" SET NOT NULL;

ALTER TABLE "Invite"
ADD CONSTRAINT "Invite_inviter_id_fkey"
FOREIGN KEY ("inviter_id") REFERENCES "User"("user_id")
ON DELETE RESTRICT ON UPDATE CASCADE;
