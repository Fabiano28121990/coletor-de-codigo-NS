/*
  # Barcode Management System

  1. New Tables
    - `barcode_lists`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text, list name)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `barcode_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references barcode_lists)
      - `barcode` (text, the scanned barcode value)
      - `created_at` (timestamptz)
      - `order_index` (integer, for maintaining scan order)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own lists
    - Users can only access items from their own lists

  3. Indexes
    - Index on list_id for faster item queries
    - Index on barcode for search functionality
*/

-- Create barcode_lists table
CREATE TABLE IF NOT EXISTS barcode_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create barcode_items table
CREATE TABLE IF NOT EXISTS barcode_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES barcode_lists(id) ON DELETE CASCADE NOT NULL,
  barcode text NOT NULL,
  created_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE barcode_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barcode_lists
CREATE POLICY "Users can view own lists"
  ON barcode_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists"
  ON barcode_lists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists"
  ON barcode_lists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists"
  ON barcode_lists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for barcode_items
CREATE POLICY "Users can view items from own lists"
  ON barcode_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barcode_lists
      WHERE barcode_lists.id = barcode_items.list_id
      AND barcode_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert items to own lists"
  ON barcode_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barcode_lists
      WHERE barcode_lists.id = barcode_items.list_id
      AND barcode_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items from own lists"
  ON barcode_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barcode_lists
      WHERE barcode_lists.id = barcode_items.list_id
      AND barcode_lists.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barcode_lists
      WHERE barcode_lists.id = barcode_items.list_id
      AND barcode_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items from own lists"
  ON barcode_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM barcode_lists
      WHERE barcode_lists.id = barcode_items.list_id
      AND barcode_lists.user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_barcode_items_list_id ON barcode_items(list_id);
CREATE INDEX IF NOT EXISTS idx_barcode_items_barcode ON barcode_items(barcode);
CREATE INDEX IF NOT EXISTS idx_barcode_lists_user_id ON barcode_lists(user_id);