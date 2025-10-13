-- Add additional fields to therapists table for settings
ALTER TABLE therapists
ADD COLUMN IF NOT EXISTS credentials TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS default_session_duration INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS session_types TEXT[] DEFAULT ARRAY['individual', 'couples', 'family', 'group'],
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_reminders": true, "appointment_confirmations": true, "cancellation_alerts": true, "at_risk_alerts": true}'::jsonb;

-- Add comment
COMMENT ON COLUMN therapists.credentials IS 'Professional credentials (e.g., PhD, LMFT, LCSW)';
COMMENT ON COLUMN therapists.bio IS 'Professional bio or description';
COMMENT ON COLUMN therapists.default_session_duration IS 'Default session duration in minutes';
COMMENT ON COLUMN therapists.session_types IS 'Custom session types for this therapist';
COMMENT ON COLUMN therapists.notification_preferences IS 'JSON object containing notification preferences';
