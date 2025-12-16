-- Create player_notifications table for email notifications
-- Execute this in your Supabase Dashboard > SQL Editor

-- Drop the table if it exists
DROP TABLE IF EXISTS player_notifications CASCADE;

-- Create the player_notifications table
CREATE TABLE player_notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id text,
  player_email text NOT NULL,
  player_name text,
  subject text NOT NULL,
  message text NOT NULL,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  sent_at timestamp with time zone DEFAULT now(),
  sent_by text,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  message_id text, -- Resend message ID
  error_details text, -- Error details if sending failed
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE player_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for Row Level Security
-- Allow admins to read all notifications
CREATE POLICY "Allow admins to read all notifications" 
ON player_notifications FOR SELECT 
USING (true);

-- Allow admins to insert notifications
CREATE POLICY "Allow admins to insert notifications" 
ON player_notifications FOR INSERT 
WITH CHECK (true);

-- Allow admins to update notifications
CREATE POLICY "Allow admins to update notifications" 
ON player_notifications FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_player_notifications_player_email ON player_notifications(player_email);
CREATE INDEX idx_player_notifications_tournament_id ON player_notifications(tournament_id);
CREATE INDEX idx_player_notifications_sent_at ON player_notifications(sent_at);
CREATE INDEX idx_player_notifications_status ON player_notifications(status);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON player_notifications TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Success message
SELECT 'Player notifications table created successfully!' AS result;
