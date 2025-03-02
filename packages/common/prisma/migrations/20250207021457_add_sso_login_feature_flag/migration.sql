-- Insert new feature flag
INSERT INTO "FeatureFlag" (feature_name, active) 
VALUES ('sso_login', true)
ON CONFLICT (feature_name) DO NOTHING;