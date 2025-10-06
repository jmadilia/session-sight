-- Seed sample journal entries for the authenticated user
-- This script creates sample entries to demonstrate the journaling functionality
-- Run this after signing up to populate your account with demo data
-- NOTE: This will use the first profile found in the profiles table

-- Added ORDER BY to ensure consistent selection of the first profile
WITH user_data AS (
  SELECT id FROM profiles ORDER BY created_at ASC LIMIT 1
)
INSERT INTO entries (user_id, title, content, mood_score, created_at)
SELECT 
  user_data.id,
  title,
  content,
  mood_score,
  created_at
FROM user_data, (
  VALUES
    (
      'A Great Start to the Week',
      'Today was an amazing day! I woke up feeling refreshed and energized. Had a productive morning working on my projects, and everything just seemed to flow naturally. I''m grateful for the support from my team and the progress we''re making. Looking forward to maintaining this momentum.',
      9,
      NOW() - INTERVAL '6 days'
    ),
    (
      'Feeling a Bit Overwhelmed',
      'There''s a lot on my plate right now. Work deadlines are piling up, and I''m struggling to find balance. I know I need to take things one step at a time, but it''s hard not to feel anxious about everything. Maybe I should try some meditation tonight to calm my mind.',
      4,
      NOW() - INTERVAL '5 days'
    ),
    (
      'Grateful for Small Moments',
      'Took a walk in the park today and really appreciated the simple beauty around me. The weather was perfect, and I had time to just breathe and be present. These quiet moments are so important for my mental health. I need to remember to make time for them more often.',
      8,
      NOW() - INTERVAL '4 days'
    ),
    (
      'Challenging Day at Work',
      'Had a difficult conversation with a colleague today. It was stressful, but I think we made progress. I''m learning that conflict isn''t always bad - it can lead to better understanding if handled well. Still feeling a bit drained though. Need to practice better self-care.',
      5,
      NOW() - INTERVAL '3 days'
    ),
    (
      'Excited About New Opportunities',
      'Just got some amazing news about a project I''ve been working on! All the hard work is paying off, and I can see the path forward clearly now. Feeling motivated and inspired to keep pushing. This is exactly the kind of positive momentum I needed.',
      9,
      NOW() - INTERVAL '2 days'
    ),
    (
      'Taking Time to Rest',
      'Decided to have a quiet day at home. No pressure, no deadlines - just relaxation. Watched some movies, read a book, and enjoyed some comfort food. Sometimes the best thing you can do for yourself is simply rest. Feeling peaceful and recharged.',
      7,
      NOW() - INTERVAL '1 day'
    ),
    (
      'Reflecting on Personal Growth',
      'Looking back at where I was a few months ago, I can see how much I''ve grown. The challenges I faced have made me stronger and more resilient. I''m learning to be kinder to myself and to celebrate small victories. This journaling practice has been incredibly helpful in tracking my progress and understanding my emotions better.',
      8,
      NOW()
    )
) AS entry_data(title, content, mood_score, created_at)
WHERE user_data.id IS NOT NULL;
