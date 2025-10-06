-- Seed sample AI-generated insights
-- This creates sample insights to demonstrate the AI analysis feature
-- Run this after running 03-seed-sample-entries.sql
-- NOTE: This will use the first profile found in the profiles table

-- Rewritten to use entry ordering instead of title matching for more reliable inserts
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
),
ordered_entries AS (
  SELECT 
    id,
    created_at,
    ROW_NUMBER() OVER (ORDER BY created_at ASC) as entry_num
  FROM entries
  WHERE user_id = (SELECT id FROM user_data)
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  (SELECT id FROM user_data),
  id,
  sentiment_score,
  key_themes,
  created_at + INTERVAL '5 minutes'
FROM ordered_entries
CROSS JOIN (
  VALUES
    (1, 0.92, ARRAY['productivity', 'gratitude', 'team collaboration', 'positive momentum']),
    (2, 0.35, ARRAY['stress', 'work pressure', 'anxiety', 'need for balance', 'self-care']),
    (3, 0.85, ARRAY['mindfulness', 'gratitude', 'nature', 'mental health awareness', 'presence']),
    (4, 0.48, ARRAY['conflict resolution', 'personal growth', 'emotional exhaustion', 'communication']),
    (5, 0.95, ARRAY['achievement', 'motivation', 'success', 'positive outlook', 'hard work paying off']),
    (6, 0.78, ARRAY['self-care', 'rest', 'relaxation', 'recharging', 'peace']),
    (7, 0.88, ARRAY['personal growth', 'resilience', 'self-compassion', 'progress tracking', 'emotional awareness'])
) AS insight_data(entry_num, sentiment_score, key_themes)
WHERE ordered_entries.entry_num = insight_data.entry_num;
