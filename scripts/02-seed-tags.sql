-- Added seed data for SessionSight
-- Insert some default tags
INSERT INTO tags (name, color) VALUES
  ('Happy', '#22c55e'),
  ('Sad', '#3b82f6'),
  ('Anxious', '#f59e0b'),
  ('Grateful', '#8b5cf6'),
  ('Excited', '#ef4444'),
  ('Calm', '#06b6d4'),
  ('Stressed', '#f97316'),
  ('Motivated', '#10b981'),
  ('Tired', '#6b7280'),
  ('Peaceful', '#84cc16')
ON CONFLICT (name) DO NOTHING;
