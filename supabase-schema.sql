-- Run this SQL in your Supabase SQL Editor to create the table and policies

CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  cover_url TEXT,
  audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (since this is a simple demo app without user authentication)
-- In a real app, you would restrict INSERT/UPDATE/DELETE to authenticated admin users.
CREATE POLICY "Enable read access for all users" ON songs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON songs FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON songs FOR DELETE USING (true);
