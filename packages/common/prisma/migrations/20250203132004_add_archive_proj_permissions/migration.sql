ALTER TYPE "Action" ADD VALUE 'archive_project';

INSERT INTO "Role" (id, role_name)
VALUES (2, 'STUDENT')
ON CONFLICT (id) DO NOTHING;
