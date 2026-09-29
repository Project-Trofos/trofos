INSERT INTO "FeatureFlag" (feature_name, active)
VALUES ('ai_autofill', true)
ON CONFLICT (feature_name) DO NOTHING;
