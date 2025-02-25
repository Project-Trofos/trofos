INSERT INTO "FeatureFlag" (feature_name, active) 
VALUES ('ai_insights', true)
ON CONFLICT (feature_name) DO NOTHING;
