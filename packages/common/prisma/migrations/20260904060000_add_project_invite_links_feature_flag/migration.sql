INSERT INTO "FeatureFlag" ("feature_name", "active")
VALUES ('project_invite_links', true)
ON CONFLICT ("feature_name") DO NOTHING;