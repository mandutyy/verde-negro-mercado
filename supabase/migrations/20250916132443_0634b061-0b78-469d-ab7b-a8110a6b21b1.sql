-- First, let's add foreign keys between conversations and profiles tables
-- This will help with performance and data integrity
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_participant_1 
FOREIGN KEY (participant_1) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_participant_2 
FOREIGN KEY (participant_2) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for profiles to allow viewing other users' profiles
-- This is needed so users can see names and avatars in conversations
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

CREATE POLICY "Users can view all profiles" 
ON profiles 
FOR SELECT 
USING (true);

-- Keep the existing policies for insert and update unchanged
-- Users can still only create and update their own profiles

-- Enable realtime for conversations and messages tables
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Add conversations and messages to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;