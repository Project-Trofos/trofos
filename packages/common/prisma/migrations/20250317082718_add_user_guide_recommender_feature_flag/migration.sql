INSERT INTO "FeatureFlag" (feature_name, active) 
VALUES ('user_guide_recommender', true)
ON CONFLICT (feature_name) DO NOTHING;
