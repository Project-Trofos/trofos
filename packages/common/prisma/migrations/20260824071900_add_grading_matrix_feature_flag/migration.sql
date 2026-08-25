INSERT INTO "FeatureFlag" (feature_name, active)
VALUES ('grading_matrix', true)
ON CONFLICT (feature_name) DO NOTHING;
