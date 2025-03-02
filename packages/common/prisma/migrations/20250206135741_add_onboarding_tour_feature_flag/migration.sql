-- Insert new feature flag
INSERT INTO "FeatureFlag" (feature_name, active) 
VALUES ('onboarding_tour', true)
ON CONFLICT (feature_name) DO NOTHING;