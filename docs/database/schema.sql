-- Note Weaver Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth)
-- This table is automatically created by Supabase Auth
-- We're including it here for reference

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT NOT NULL,
  summary TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Action Items table
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  owner TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_updated_at_idx ON notes(updated_at);
CREATE INDEX notes_tags_idx ON notes USING GIN(tags);

CREATE INDEX meetings_user_id_idx ON meetings(user_id);
CREATE INDEX meetings_meeting_date_idx ON meetings(meeting_date);

CREATE INDEX action_items_meeting_id_idx ON action_items(meeting_id);
CREATE INDEX action_items_due_date_idx ON action_items(due_date);
CREATE INDEX action_items_status_idx ON action_items(status);

-- Create triggers for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
BEFORE UPDATE ON meetings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at
BEFORE UPDATE ON action_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create validation functions
-- Validate subscription tier
CREATE OR REPLACE FUNCTION validate_subscription_tier()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subscription_tier NOT IN ('free', 'pro') THEN
    RAISE EXCEPTION 'Invalid subscription tier: %', NEW.subscription_tier;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_subscription_tier_trigger
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION validate_subscription_tier();

-- Validate action item status
CREATE OR REPLACE FUNCTION validate_action_item_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status NOT IN ('pending', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Invalid action item status: %', NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_action_item_status_trigger
BEFORE INSERT OR UPDATE ON action_items
FOR EACH ROW EXECUTE FUNCTION validate_action_item_status();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Notes policies
CREATE POLICY notes_select ON notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notes_insert ON notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY notes_update ON notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notes_delete ON notes FOR DELETE USING (auth.uid() = user_id);

-- Meetings policies
CREATE POLICY meetings_select ON meetings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY meetings_insert ON meetings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY meetings_update ON meetings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY meetings_delete ON meetings FOR DELETE USING (auth.uid() = user_id);

-- Action items policies
CREATE POLICY action_items_select ON action_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM meetings
    WHERE meetings.id = action_items.meeting_id
    AND meetings.user_id = auth.uid()
  )
);

CREATE POLICY action_items_insert ON action_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM meetings
    WHERE meetings.id = action_items.meeting_id
    AND meetings.user_id = auth.uid()
  )
);

CREATE POLICY action_items_update ON action_items FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM meetings
    WHERE meetings.id = action_items.meeting_id
    AND meetings.user_id = auth.uid()
  )
);

CREATE POLICY action_items_delete ON action_items FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM meetings
    WHERE meetings.id = action_items.meeting_id
    AND meetings.user_id = auth.uid()
  )
);

-- Create functions for common operations
-- Get all action items for a user
CREATE OR REPLACE FUNCTION get_user_action_items(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  meeting_id UUID,
  description TEXT,
  owner TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT,
  meeting_title TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ai.id,
    ai.meeting_id,
    ai.description,
    ai.owner,
    ai.due_date,
    ai.status,
    m.title AS meeting_title,
    m.meeting_date
  FROM
    action_items ai
  JOIN
    meetings m ON ai.meeting_id = m.id
  WHERE
    m.user_id = user_uuid
  ORDER BY
    ai.due_date ASC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

