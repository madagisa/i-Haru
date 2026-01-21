-- i-Haru Database Schema for Cloudflare D1

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT CHECK(role IN ('parent', 'child')) NOT NULL,
  family_id TEXT,
  color TEXT DEFAULT '#4A90E2',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Families table
CREATE TABLE IF NOT EXISTS families (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES families(id),
  child_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  start_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_all_day BOOLEAN DEFAULT FALSE,
  color TEXT,
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recurrences table
CREATE TABLE IF NOT EXISTS recurrences (
  id TEXT PRIMARY KEY,
  schedule_id TEXT REFERENCES schedules(id) ON DELETE CASCADE,
  frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'monthly')) NOT NULL,
  days_of_week TEXT,
  end_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Preparations table
CREATE TABLE IF NOT EXISTS preparations (
  id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES families(id),
  child_id TEXT REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES families(id),
  from_user_id TEXT REFERENCES users(id),
  to_user_id TEXT REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Child profiles table (for parent-registered children with individual invite codes)
CREATE TABLE IF NOT EXISTS child_profiles (
  id TEXT PRIMARY KEY,
  family_id TEXT REFERENCES families(id),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#4ECDC4',
  invite_code TEXT UNIQUE NOT NULL,
  linked_user_id TEXT REFERENCES users(id),
  created_by TEXT REFERENCES users(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_family ON users(family_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_schedules_family ON schedules(family_id);
CREATE INDEX IF NOT EXISTS idx_schedules_child ON schedules(child_id);
CREATE INDEX IF NOT EXISTS idx_schedules_date ON schedules(start_date);
CREATE INDEX IF NOT EXISTS idx_preparations_family ON preparations(family_id);
CREATE INDEX IF NOT EXISTS idx_preparations_child ON preparations(child_id);
CREATE INDEX IF NOT EXISTS idx_preparations_due ON preparations(due_date);
CREATE INDEX IF NOT EXISTS idx_messages_family ON messages(family_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_family ON child_profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_child_profiles_invite ON child_profiles(invite_code);
CREATE INDEX IF NOT EXISTS idx_child_profiles_linked ON child_profiles(linked_user_id);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);
