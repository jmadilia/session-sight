-- Seed sample data for therapist platform
-- This creates a therapist profile and sample clients, sessions, and appointments for testing

-- First, ensure a therapist profile exists for the first user
DO $$
DECLARE
  v_user_id UUID;
  v_therapist_id UUID;
BEGIN
  -- Get the first user from profiles
  SELECT id INTO v_user_id FROM profiles ORDER BY created_at ASC LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in profiles table. Please sign up first.';
  END IF;
  
  -- Fixed: therapists table uses 'id' not 'user_id'
  -- Check if therapist already exists for this user
  SELECT id INTO v_therapist_id FROM therapists WHERE id = v_user_id;
  
  -- If no therapist exists, create one
  IF v_therapist_id IS NULL THEN
    INSERT INTO therapists (id, license_number, specialization, practice_name, phone)
    VALUES (v_user_id, 'LIC-12345', ARRAY['Clinical Psychology', 'Cognitive Behavioral Therapy'], 'Mindful Practice', '555-0100')
    RETURNING id INTO v_therapist_id;
    
    RAISE NOTICE 'Created therapist profile with ID: %', v_therapist_id;
  ELSE
    RAISE NOTICE 'Using existing therapist profile with ID: %', v_therapist_id;
  END IF;
END $$;

-- Simplified CTE to directly select from therapists table
-- Insert sample clients
WITH therapist_data AS (
  SELECT id FROM therapists ORDER BY created_at ASC LIMIT 1
)
INSERT INTO clients (therapist_id, first_name, last_name, email, phone, date_of_birth, initial_session_date, status, notes)
SELECT 
  therapist_data.id,
  first_name,
  last_name,
  email,
  phone,
  date_of_birth::date,
  initial_session_date::date,
  status,
  notes
FROM therapist_data,
(VALUES
  ('Sarah', 'Johnson', 'sarah.j@email.com', '555-0101', '1985-03-15', '2024-01-10', 'active', 'Presenting with anxiety and work-related stress. Making good progress.'),
  ('Michael', 'Chen', 'michael.c@email.com', '555-0102', '1992-07-22', '2024-02-05', 'active', 'Depression and relationship issues. Engaged in treatment.'),
  ('Emily', 'Rodriguez', 'emily.r@email.com', '555-0103', '1988-11-30', '2023-11-20', 'active', 'PTSD from past trauma. Showing improvement with EMDR.'),
  ('David', 'Thompson', 'david.t@email.com', '555-0104', '1995-05-18', '2024-03-01', 'active', 'Social anxiety. Recently started exposure therapy.'),
  ('Jessica', 'Williams', 'jessica.w@email.com', '555-0105', '1990-09-08', '2023-10-15', 'inactive', 'Completed treatment goals. Discharged with maintenance plan.'),
  ('Robert', 'Martinez', 'robert.m@email.com', '555-0106', '1987-12-25', '2024-01-25', 'active', 'Bipolar disorder management. Stable on medication.'),
  ('Amanda', 'Taylor', 'amanda.t@email.com', '555-0107', '1993-04-12', '2024-02-20', 'active', 'Eating disorder recovery. Making steady progress.'),
  ('James', 'Anderson', 'james.a@email.com', '555-0108', '1991-08-05', '2023-12-10', 'active', 'Grief counseling after loss. Processing emotions well.')
) AS client_data(first_name, last_name, email, phone, date_of_birth, initial_session_date, status, notes)
ON CONFLICT DO NOTHING;

-- Simplified CTE to directly select from therapists table
-- Insert sample sessions for the past 3 months
WITH therapist_data AS (
  SELECT id FROM therapists ORDER BY created_at ASC LIMIT 1
),
client_list AS (
  SELECT id, first_name 
  FROM clients 
  WHERE therapist_id = (SELECT id FROM therapist_data)
  ORDER BY created_at ASC
)
INSERT INTO sessions (therapist_id, client_id, session_date, duration_minutes, session_type, status, mood_rating, progress_rating)
SELECT 
  (SELECT id FROM therapist_data),
  client_id,
  session_date,
  duration_minutes,
  session_type,
  status,
  mood_rating,
  progress_rating
FROM (
  -- Sarah Johnson sessions (consistent attendance)
  SELECT (SELECT id FROM client_list WHERE first_name = 'Sarah' LIMIT 1) as client_id, NOW() - INTERVAL '7 days' as session_date, 50 as duration_minutes, 'individual' as session_type, 'completed' as status, 7 as mood_rating, 8 as progress_rating
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Sarah' LIMIT 1), NOW() - INTERVAL '14 days', 50, 'individual', 'completed', 6, 7
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Sarah' LIMIT 1), NOW() - INTERVAL '21 days', 50, 'individual', 'completed', 5, 6
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Sarah' LIMIT 1), NOW() - INTERVAL '28 days', 50, 'individual', 'completed', 6, 7
  
  -- Michael Chen sessions (some cancellations)
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Michael' LIMIT 1), NOW() - INTERVAL '5 days', 50, 'individual', 'completed', 5, 6
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Michael' LIMIT 1), NOW() - INTERVAL '12 days', 50, 'individual', 'cancelled', NULL, NULL
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Michael' LIMIT 1), NOW() - INTERVAL '19 days', 50, 'individual', 'completed', 4, 5
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Michael' LIMIT 1), NOW() - INTERVAL '26 days', 50, 'individual', 'completed', 5, 6
  
  -- Emily Rodriguez sessions (excellent progress)
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Emily' LIMIT 1), NOW() - INTERVAL '6 days', 60, 'individual', 'completed', 8, 9
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Emily' LIMIT 1), NOW() - INTERVAL '13 days', 60, 'individual', 'completed', 7, 8
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Emily' LIMIT 1), NOW() - INTERVAL '20 days', 60, 'individual', 'completed', 7, 8
  
  -- David Thompson sessions (recent start, good engagement)
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'David' LIMIT 1), NOW() - INTERVAL '4 days', 50, 'individual', 'completed', 6, 7
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'David' LIMIT 1), NOW() - INTERVAL '11 days', 50, 'individual', 'completed', 5, 6
  
  -- Robert Martinez sessions (stable, bi-weekly)
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Robert' LIMIT 1), NOW() - INTERVAL '10 days', 50, 'individual', 'completed', 7, 7
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Robert' LIMIT 1), NOW() - INTERVAL '24 days', 50, 'individual', 'completed', 7, 7
  
  -- Amanda Taylor sessions (weekly, making progress)
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Amanda' LIMIT 1), NOW() - INTERVAL '8 days', 50, 'individual', 'completed', 6, 7
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Amanda' LIMIT 1), NOW() - INTERVAL '15 days', 50, 'individual', 'completed', 5, 6
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Amanda' LIMIT 1), NOW() - INTERVAL '22 days', 50, 'individual', 'completed', 6, 7
  
  -- James Anderson sessions (grief work, variable attendance)
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'James' LIMIT 1), NOW() - INTERVAL '9 days', 50, 'individual', 'completed', 4, 5
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'James' LIMIT 1), NOW() - INTERVAL '16 days', 50, 'individual', 'no-show', NULL, NULL
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'James' LIMIT 1), NOW() - INTERVAL '30 days', 50, 'individual', 'completed', 3, 4
) AS session_data
WHERE client_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Simplified CTE to directly select from therapists table
-- Insert upcoming appointments
WITH therapist_data AS (
  SELECT id FROM therapists ORDER BY created_at ASC LIMIT 1
),
client_list AS (
  SELECT id, first_name 
  FROM clients 
  WHERE therapist_id = (SELECT id FROM therapist_data) AND status = 'active'
  ORDER BY created_at ASC
)
INSERT INTO appointments (therapist_id, client_id, appointment_date, duration_minutes, status, notes)
SELECT 
  (SELECT id FROM therapist_data),
  client_id,
  appointment_date,
  duration_minutes,
  status,
  notes
FROM (
  SELECT (SELECT id FROM client_list WHERE first_name = 'Sarah' LIMIT 1) as client_id, NOW() + INTERVAL '2 days' as appointment_date, 50 as duration_minutes, 'confirmed' as status, 'Regular weekly session' as notes
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Michael' LIMIT 1), NOW() + INTERVAL '3 days', 50, 'scheduled', 'Follow-up on medication adjustment'
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Emily' LIMIT 1), NOW() + INTERVAL '5 days', 60, 'confirmed', 'EMDR session'
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'David' LIMIT 1), NOW() + INTERVAL '4 days', 50, 'scheduled', 'Exposure therapy session'
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Robert' LIMIT 1), NOW() + INTERVAL '7 days', 50, 'confirmed', 'Bi-weekly check-in'
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'Amanda' LIMIT 1), NOW() + INTERVAL '6 days', 50, 'scheduled', 'Weekly session'
  UNION ALL SELECT (SELECT id FROM client_list WHERE first_name = 'James' LIMIT 1), NOW() + INTERVAL '8 days', 50, 'scheduled', 'Grief processing'
) AS appointment_data
WHERE client_id IS NOT NULL
ON CONFLICT DO NOTHING;
