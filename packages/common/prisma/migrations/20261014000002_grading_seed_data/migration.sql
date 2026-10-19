-- Data for the grading feature: role permissions and the feature flag. Split into its
-- own migration because it uses enum values added in grading_schema, which Postgres
-- doesn't allow using in the same transaction they were added in.

-- Insert into ActionsOnRoles
INSERT INTO "ActionsOnRoles" (role_id, action)
VALUES
  (1, 'create_grade'),
  (1, 'read_grade'),
  (1, 'update_grade'),
  (1, 'delete_grade'),
  (2, 'read_grade')
ON CONFLICT (role_id, action) DO NOTHING;

-- Insert into FeatureFlag
INSERT INTO "FeatureFlag" (feature_name, active)
VALUES ('manual_grading', true)
ON CONFLICT (feature_name) DO NOTHING;
