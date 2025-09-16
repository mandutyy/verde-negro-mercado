-- Add message status tracking fields
ALTER TABLE messages 
ADD COLUMN delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read'));

-- Create function to mark messages as delivered when they're inserted
CREATE OR REPLACE FUNCTION mark_message_delivered()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark message as delivered immediately after insertion
  NEW.delivered_at = NOW();
  NEW.status = 'delivered';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic message delivery marking
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