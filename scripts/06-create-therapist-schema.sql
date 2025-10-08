-- SessionSight Therapist Platform Schema
-- This creates the proper schema for therapists managing clients and sessions

-- Create therapists table (extends profiles for therapist-specific data)
CREATE TABLE IF NOT EXISTS therapists (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  license_number TEXT,
  specialization TEXT[],
  practice_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  initial_session_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discharged')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table (therapy sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  session_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  session_type TEXT DEFAULT 'individual' CHECK (session_type IN ('individual', 'couples', 'family', 'group')),
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create session_notes table
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  interventions TEXT[],
  goals_addressed TEXT[],
  homework_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  therapist_id UUID REFERENCES therapists(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 50,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  cancellation_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create client_metrics table (for tracking engagement patterns)
CREATE TABLE IF NOT EXISTS client_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  metric_date DATE NOT NULL,
  attendance_rate DECIMAL(5,2),
  cancellation_count INTEGER DEFAULT 0,
  no_show_count INTEGER DEFAULT 0,
  engagement_score INTEGER CHECK (engagement_score >= 1 AND engagement_score <= 10),
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, metric_date)
);

-- Enable Row Level Security
ALTER TABLE therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for therapists
CREATE POLICY "Therapists can view own profile" ON therapists
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Therapists can update own profile" ON therapists
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Therapists can insert own profile" ON therapists
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "Therapists can view own clients" ON clients
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = therapist_id);

-- RLS Policies for sessions
CREATE POLICY "Therapists can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own sessions" ON sessions
  FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own sessions" ON sessions
  FOR DELETE USING (auth.uid() = therapist_id);

-- RLS Policies for session_notes
CREATE POLICY "Therapists can view notes for own sessions" ON session_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_notes.session_id 
      AND sessions.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can insert notes for own sessions" ON session_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_notes.session_id 
      AND sessions.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can update notes for own sessions" ON session_notes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_notes.session_id 
      AND sessions.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can delete notes for own sessions" ON session_notes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM sessions 
      WHERE sessions.id = session_notes.session_id 
      AND sessions.therapist_id = auth.uid()
    )
  );

-- RLS Policies for appointments
CREATE POLICY "Therapists can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can insert own appointments" ON appointments
  FOR INSERT WITH CHECK (auth.uid() = therapist_id);

CREATE POLICY "Therapists can update own appointments" ON appointments
  FOR UPDATE USING (auth.uid() = therapist_id);

CREATE POLICY "Therapists can delete own appointments" ON appointments
  FOR DELETE USING (auth.uid() = therapist_id);

-- RLS Policies for client_metrics
CREATE POLICY "Therapists can view metrics for own clients" ON client_metrics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_metrics.client_id 
      AND clients.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can insert metrics for own clients" ON client_metrics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_metrics.client_id 
      AND clients.therapist_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can update metrics for own clients" ON client_metrics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = client_metrics.client_id 
      AND clients.therapist_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS clients_therapist_id_idx ON clients(therapist_id);
CREATE INDEX IF NOT EXISTS clients_status_idx ON clients(status);
CREATE INDEX IF NOT EXISTS sessions_therapist_id_idx ON sessions(therapist_id);
CREATE INDEX IF NOT EXISTS sessions_client_id_idx ON sessions(client_id);
CREATE INDEX IF NOT EXISTS sessions_session_date_idx ON sessions(session_date);
CREATE INDEX IF NOT EXISTS sessions_status_idx ON sessions(status);
CREATE INDEX IF NOT EXISTS session_notes_session_id_idx ON session_notes(session_id);
CREATE INDEX IF NOT EXISTS appointments_therapist_id_idx ON appointments(therapist_id);
CREATE INDEX IF NOT EXISTS appointments_client_id_idx ON appointments(client_id);
CREATE INDEX IF NOT EXISTS appointments_appointment_date_idx ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS client_metrics_client_id_idx ON client_metrics(client_id);
CREATE INDEX IF NOT EXISTS client_metrics_metric_date_idx ON client_metrics(metric_date);

-- Create triggers for updated_at
CREATE TRIGGER update_therapists_updated_at BEFORE UPDATE ON therapists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_notes_updated_at BEFORE UPDATE ON session_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
