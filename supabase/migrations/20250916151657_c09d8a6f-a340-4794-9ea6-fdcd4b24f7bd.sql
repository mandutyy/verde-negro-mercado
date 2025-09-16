-- Add message status tracking fields if they don't exist
DO $$ 
BEGIN
  -- Add delivered_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'delivered_at') THEN
    ALTER TABLE messages ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'status') THEN
    ALTER TABLE messages ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));
  END IF;
END $$;

-- Create function to mark messages as delivered when they're inserted
CREATE OR REPLACE FUNCTION mark_message_delivered()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark message as delivered immediately after insertion
  IF NEW.delivered_at IS NULL THEN
    NEW.delivered_at = NOW();
  END IF;
  IF NEW.status IS NULL THEN
    NEW.status = 'delivered';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS trigger_mark_message_delivered ON messages;
CREATE TRIGGER trigger_mark_message_delivered
  BEFORE INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_message_delivered();

-- Create function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(conversation_uuid UUID, user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE messages 
  SET read_at = NOW(), status = 'read'
  WHERE conversation_id = conversation_uuid 
    AND sender_id != user_uuid 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get conversation with last message info
CREATE OR REPLACE FUNCTION get_conversations_with_last_message(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  participant_1 UUID,
  participant_2 UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_content TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  last_message_sender UUID,
  unread_count BIGINT,
  participant_1_name TEXT,
  participant_1_avatar TEXT,
  participant_2_name TEXT,  
  participant_2_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.participant_1,
    c.participant_2,
    c.created_at,
    c.updated_at,
    lm.content as last_message_content,
    lm.created_at as last_message_time,
    lm.sender_id as last_message_sender,
    COALESCE(unread.count, 0) as unread_count,
    p1.name as participant_1_name,
    p1.avatar_url as participant_1_avatar,
    p2.name as participant_2_name,
    p2.avatar_url as participant_2_avatar
  FROM conversations c
  LEFT JOIN LATERAL (
    SELECT content, created_at, sender_id
    FROM messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON true
  LEFT JOIN LATERAL (
    SELECT COUNT(*) as count
    FROM messages m
    WHERE m.conversation_id = c.id
      AND m.sender_id != user_uuid
      AND m.read_at IS NULL
  ) unread ON true
  LEFT JOIN profiles p1 ON p1.user_id = c.participant_1
  LEFT JOIN profiles p2 ON p2.user_id = c.participant_2
  WHERE (c.participant_1 = user_uuid OR c.participant_2 = user_uuid)
  ORDER BY COALESCE(lm.created_at, c.updated_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;