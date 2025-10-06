-- Seed sample entry-tag relationships
-- This links the sample entries with appropriate tags
-- Run this after running 03-seed-sample-entries.sql
-- NOTE: This will use the first profile found in the profiles table

-- Added ORDER BY to ensure consistent selection of the first profile
-- Entry 1: "A Great Start to the Week" - Happy, Motivated, Grateful
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'A Great Start to the Week'
  AND t.name IN ('Happy', 'Motivated', 'Grateful')
  AND user_data.id IS NOT NULL;

-- Entry 2: "Feeling a Bit Overwhelmed" - Anxious, Stressed
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Feeling a Bit Overwhelmed'
  AND t.name IN ('Anxious', 'Stressed')
  AND user_data.id IS NOT NULL;

-- Entry 3: "Grateful for Small Moments" - Grateful, Calm, Peaceful
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Grateful for Small Moments'
  AND t.name IN ('Grateful', 'Calm', 'Peaceful')
  AND user_data.id IS NOT NULL;

-- Entry 4: "Challenging Day at Work" - Stressed, Tired
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Challenging Day at Work'
  AND t.name IN ('Stressed', 'Tired')
  AND user_data.id IS NOT NULL;

-- Entry 5: "Excited About New Opportunities" - Excited, Motivated, Happy
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Excited About New Opportunities'
  AND t.name IN ('Excited', 'Motivated', 'Happy')
  AND user_data.id IS NOT NULL;

-- Entry 6: "Taking Time to Rest" - Calm, Peaceful, Grateful
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Taking Time to Rest'
  AND t.name IN ('Calm', 'Peaceful', 'Grateful')
  AND user_data.id IS NOT NULL;

-- Entry 7: "Reflecting on Personal Growth" - Happy, Grateful, Motivated
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entry_tags (entry_id, tag_id)
SELECT e.id, t.id
FROM entries e
CROSS JOIN tags t
CROSS JOIN user_data
WHERE e.user_id = user_data.id
  AND e.title = 'Reflecting on Personal Growth'
  AND t.name IN ('Happy', 'Grateful', 'Motivated')
  AND user_data.id IS NOT NULL;
