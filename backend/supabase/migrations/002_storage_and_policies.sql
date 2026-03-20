-- Migration: 002_storage_and_policies
-- Run this in the Supabase SQL Editor after 001_initial_schema.sql

-- ── Storage bucket ────────────────────────────────────────────────────────────
-- Create via dashboard: Storage → New Bucket → Name: "clinic-assets", Public: ON
-- OR run the following (requires pg_storage extension, available in Supabase):

INSERT INTO storage.buckets (id, name, public)
VALUES ('clinic-assets', 'clinic-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ── Storage RLS policies ──────────────────────────────────────────────────────

-- Authenticated users can upload to their own logo path
CREATE POLICY "Users upload own logo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'clinic-assets'
    AND name = 'logos/' || auth.uid() || '.' || (string_to_array(name, '.'))[array_length(string_to_array(name, '.'), 1)]
  );

-- Authenticated users can update/replace their own logo
CREATE POLICY "Users update own logo"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'clinic-assets' AND auth.uid()::text = (string_to_array(name, '/'))[2]::text);

-- Anyone can read public assets (logos are public for sharing)
CREATE POLICY "Public read clinic assets"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'clinic-assets');

-- ── Profiles: auto-create on signup ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Content: admins can insert/update/delete ──────────────────────────────────
CREATE POLICY "Admins manage content"
  ON content FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE user_id = auth.uid())
  );
