-- Migration: 001_initial_schema
-- Supabase uses PostgreSQL. auth.users is managed by Supabase Auth.

-- Clinic profile for each authenticated user
CREATE TABLE profiles (
    id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_name VARCHAR(150),
    clinic_info TEXT,
    logo_url    TEXT,
    discipline  VARCHAR(100),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Promo content created by admins
CREATE TABLE content (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       VARCHAR(255)  NOT NULL,
    body        TEXT          NOT NULL,
    discipline  VARCHAR(100)  NOT NULL,
    image_url   TEXT,
    created_at  TIMESTAMPTZ   DEFAULT NOW(),
    updated_at  TIMESTAMPTZ   DEFAULT NOW()
);

-- Admin role table
CREATE TABLE admin (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role        VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content  ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own profile
CREATE POLICY "Own profile access"
    ON profiles FOR ALL
    USING (auth.uid() = id);

-- All authenticated users can read content
CREATE POLICY "Authenticated read content"
    ON content FOR SELECT
    USING (auth.role() = 'authenticated');
