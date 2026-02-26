/*
  # Create remessa_files table

  1. New Tables
    - `remessa_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `filename` (text)
      - `content` (text)
      - `remessa_number` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `remessa_files` table
    - Add policy for users to read their own remessa files
*/

CREATE TABLE IF NOT EXISTS remessa_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  content text NOT NULL,
  remessa_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE remessa_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own remessa files"
  ON remessa_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own remessa files"
  ON remessa_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
