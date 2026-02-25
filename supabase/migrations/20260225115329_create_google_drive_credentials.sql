/*
  # Create Google Drive Credentials Table

  1. New Tables
    - `google_drive_credentials`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `access_token` (text, encrypted)
      - `refresh_token` (text, encrypted)
      - `token_expires_at` (timestamp)
      - `email` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `google_drive_credentials` table
    - Add policy for users to manage their own credentials
*/

CREATE TABLE IF NOT EXISTS google_drive_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE google_drive_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own Google Drive credentials"
  ON google_drive_credentials FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
