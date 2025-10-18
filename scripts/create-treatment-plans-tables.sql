-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  target_end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued', 'on_hold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_plan_id UUID NOT NULL REFERENCES treatment_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'discontinued')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create interventions table
CREATE TABLE IF NOT EXISTS interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create progress_updates table
CREATE TABLE IF NOT EXISTS progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  update_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress_note TEXT NOT NULL,
  progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_treatment_plans_client_id ON treatment_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_therapist_id ON treatment_plans(therapist_id);
CREATE INDEX IF NOT EXISTS idx_goals_treatment_plan_id ON goals(treatment_plan_id);
CREATE INDEX IF NOT EXISTS idx_interventions_goal_id ON interventions(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_goal_id ON progress_updates(goal_id);
CREATE INDEX IF NOT EXISTS idx_progress_updates_session_id ON progress_updates(session_id);

-- Add RLS policies
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_updates ENABLE ROW LEVEL SECURITY;

-- Treatment plans policies
CREATE POLICY "Therapists can view their own treatment plans"
  ON treatment_plans FOR SELECT
  USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can create treatment plans"
  ON treatment_plans FOR INSERT
  WITH CHECK (therapist_id = auth.uid());

CREATE POLICY "Therapists can update their own treatment plans"
  ON treatment_plans FOR UPDATE
  USING (therapist_id = auth.uid());

CREATE POLICY "Therapists can delete their own treatment plans"
  ON treatment_plans FOR DELETE
  USING (therapist_id = auth.uid());

-- Goals policies
CREATE POLICY "Therapists can view goals for their treatment plans"
  ON goals FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM treatment_plans
    WHERE treatment_plans.id = goals.treatment_plan_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can create goals for their treatment plans"
  ON goals FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM treatment_plans
    WHERE treatment_plans.id = goals.treatment_plan_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can update goals for their treatment plans"
  ON goals FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM treatment_plans
    WHERE treatment_plans.id = goals.treatment_plan_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can delete goals for their treatment plans"
  ON goals FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM treatment_plans
    WHERE treatment_plans.id = goals.treatment_plan_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

-- Interventions policies
CREATE POLICY "Therapists can view interventions for their goals"
  ON interventions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = interventions.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can create interventions for their goals"
  ON interventions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = interventions.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can update interventions for their goals"
  ON interventions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = interventions.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can delete interventions for their goals"
  ON interventions FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = interventions.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

-- Progress updates policies
CREATE POLICY "Therapists can view progress updates for their goals"
  ON progress_updates FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = progress_updates.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can create progress updates for their goals"
  ON progress_updates FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = progress_updates.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can update progress updates for their goals"
  ON progress_updates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = progress_updates.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));

CREATE POLICY "Therapists can delete progress updates for their goals"
  ON progress_updates FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM goals
    JOIN treatment_plans ON treatment_plans.id = goals.treatment_plan_id
    WHERE goals.id = progress_updates.goal_id
    AND treatment_plans.therapist_id = auth.uid()
  ));
