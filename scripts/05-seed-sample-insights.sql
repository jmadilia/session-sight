-- Seed sample AI-generated insights
-- This creates sample insights to demonstrate the AI analysis feature
-- Run this after running 03-seed-sample-entries.sql
-- NOTE: This will use the first profile found in the profiles table

-- Added ORDER BY to ensure consistent selection of the first profile
-- Entry 1: "A Great Start to the Week"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.92,
  ARRAY['productivity', 'gratitude', 'team collaboration', 'positive momentum'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'A Great Start to the Week'
  AND user_data.id IS NOT NULL;

-- Entry 2: "Feeling a Bit Overwhelmed"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.35,
  ARRAY['stress', 'work pressure', 'anxiety', 'need for balance', 'self-care'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Feeling a Bit Overwhelmed'
  AND user_data.id IS NOT NULL;

-- Entry 3: "Grateful for Small Moments"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.85,
  ARRAY['mindfulness', 'gratitude', 'nature', 'mental health awareness', 'presence'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Grateful for Small Moments'
  AND user_data.id IS NOT NULL;

-- Entry 4: "Challenging Day at Work"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.48,
  ARRAY['conflict resolution', 'personal growth', 'emotional exhaustion', 'communication'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Challenging Day at Work'
  AND user_data.id IS NOT NULL;

-- Entry 5: "Excited About New Opportunities"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.95,
  ARRAY['achievement', 'motivation', 'success', 'positive outlook', 'hard work paying off'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Excited About New Opportunities'
  AND user_data.id IS NOT NULL;

-- Entry 6: "Taking Time to Rest"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.78,
  ARRAY['self-care', 'rest', 'relaxation', 'recharging', 'peace'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Taking Time to Rest'
  AND user_data.id IS NOT NULL;

-- Entry 7: "Reflecting on Personal Growth"
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO insights (user_id, entry_id, sentiment_score, key_themes, generated_at)
SELECT 
  user_data.id,
  e.id,
  0.88,
  ARRAY['personal growth', 'resilience', 'self-compassion', 'progress tracking', 'emotional awareness'],
  e.created_at + INTERVAL '5 minutes'
FROM entries e
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Reflecting on Personal Growth'
  AND user_data.id IS NOT NULL;
