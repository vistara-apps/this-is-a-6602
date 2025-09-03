# Note Weaver Data Models

This document provides detailed information about the data models used in Note Weaver, including their structure, relationships, and validation rules.

## User

The User model represents a registered user of the application.

### Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | UUID | Unique identifier for the user | Primary key, auto-generated |
| email | TEXT | User's email address | Unique, required |
| created_at | TIMESTAMP | When the user was created | Auto-generated |
| updated_at | TIMESTAMP | When the user was last updated | Auto-generated |

### Relationships

- One-to-one relationship with Profile
- One-to-many relationship with Note
- One-to-many relationship with Meeting

### Validation Rules

- Email must be a valid email format
- Email must be unique across all users

## Profile

The Profile model contains additional information about a user, including their subscription tier.

### Schema

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subscription_tier TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | UUID | Unique identifier for the profile | Primary key, auto-generated |
| user_id | UUID | Reference to the user | Foreign key, unique |
| subscription_tier | TEXT | User's subscription tier | Default: 'free' |
| created_at | TIMESTAMP | When the profile was created | Auto-generated |
| updated_at | TIMESTAMP | When the profile was last updated | Auto-generated |

### Relationships

- One-to-one relationship with User

### Validation Rules

- subscription_tier must be one of: 'free', 'pro'
- user_id must reference a valid user

## Note

The Note model represents a user's note.

### Schema

```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | UUID | Unique identifier for the note | Primary key, auto-generated |
| user_id | UUID | Reference to the user | Foreign key |
| title | TEXT | Note title | Required |
| content | TEXT | Note content (HTML) | Required |
| tags | TEXT[] | Array of tags | Default: empty array |
| created_at | TIMESTAMP | When the note was created | Auto-generated |
| updated_at | TIMESTAMP | When the note was last updated | Auto-generated |

### Relationships

- Many-to-one relationship with User

### Validation Rules

- title must not be empty
- content must not be empty
- user_id must reference a valid user

## Meeting

The Meeting model represents a meeting with a transcript and summary.

### Schema

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT NOT NULL,
  summary TEXT,
  meeting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | UUID | Unique identifier for the meeting | Primary key, auto-generated |
| user_id | UUID | Reference to the user | Foreign key |
| title | TEXT | Meeting title | Required |
| transcript | TEXT | Meeting transcript | Required |
| summary | TEXT | AI-generated summary | Optional |
| meeting_date | TIMESTAMP | Date of the meeting | Default: current time |
| created_at | TIMESTAMP | When the meeting was created | Auto-generated |
| updated_at | TIMESTAMP | When the meeting was last updated | Auto-generated |

### Relationships

- Many-to-one relationship with User
- One-to-many relationship with ActionItem

### Validation Rules

- title must not be empty
- transcript must not be empty
- user_id must reference a valid user

## ActionItem

The ActionItem model represents a task extracted from a meeting.

### Schema

```sql
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
```

### Fields

| Field | Type | Description | Constraints |
|-------|------|-------------|------------|
| id | UUID | Unique identifier for the action item | Primary key, auto-generated |
| meeting_id | UUID | Reference to the meeting | Foreign key |
| description | TEXT | Description of the action item | Required |
| owner | TEXT | Person responsible for the action item | Optional |
| due_date | TIMESTAMP | When the action item is due | Optional |
| status | TEXT | Status of the action item | Default: 'pending' |
| created_at | TIMESTAMP | When the action item was created | Auto-generated |
| updated_at | TIMESTAMP | When the action item was last updated | Auto-generated |

### Relationships

- Many-to-one relationship with Meeting

### Validation Rules

- description must not be empty
- meeting_id must reference a valid meeting
- status must be one of: 'pending', 'in_progress', 'completed'

## Database Indexes

To optimize query performance, the following indexes are created:

```sql
-- Notes indexes
CREATE INDEX notes_user_id_idx ON notes(user_id);
CREATE INDEX notes_updated_at_idx ON notes(updated_at);
CREATE INDEX notes_tags_idx ON notes USING GIN(tags);

-- Meetings indexes
CREATE INDEX meetings_user_id_idx ON meetings(user_id);
CREATE INDEX meetings_meeting_date_idx ON meetings(meeting_date);

-- Action items indexes
CREATE INDEX action_items_meeting_id_idx ON action_items(meeting_id);
CREATE INDEX action_items_due_date_idx ON action_items(due_date);
CREATE INDEX action_items_status_idx ON action_items(status);
```

## Row-Level Security Policies

To ensure data privacy, the following row-level security policies are implemented:

```sql
-- Enable row-level security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

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
```

## Data Validation Functions

To ensure data integrity, the following validation functions are implemented:

```sql
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
```

## Entity-Relationship Diagram

```
+-------+       +----------+       +-------+       +-------------+
| Users |------>| Profiles |       | Notes |       | Meetings    |
+-------+       +----------+       +-------+       +-------------+
    |                                  ^                 |
    |                                  |                 |
    +----------------------------------+                 |
    |                                                    |
    v                                                    v
+-------------+                                   +-------------+
| Action Items|<----------------------------------+             |
+-------------+                                   +-------------+
```

