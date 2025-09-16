-- Fix the ambiguous column reference in get_conversations_with_last_message function
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
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.participant_1,
    c.participant_2,
    c.created_at,
    c.updated_at,
    lm.content as last_message_content,
    lm.message_created_at as last_message_time,
    lm.sender_id as last_message_sender,
    COALESCE(unread.count, 0) as unread_count,
    p1.name as participant_1_name,
    p1.avatar_url as participant_1_avatar,
    p2.name as participant_2_name,
    p2.avatar_url as participant_2_avatar
  FROM conversations c
  LEFT JOIN LATERAL (
    SELECT content, created_at as message_created_at, sender_id
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
  ORDER BY COALESCE(lm.message_created_at, c.updated_at) DESC;
END;
$$;