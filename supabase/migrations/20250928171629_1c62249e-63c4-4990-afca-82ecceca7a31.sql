-- Fix the ambiguous column reference in get_conversations_with_last_message function
CREATE OR REPLACE FUNCTION public.get_conversations_with_last_message(user_uuid uuid)
 RETURNS TABLE(id uuid, participant_1 uuid, participant_2 uuid, plant_id uuid, created_at timestamp with time zone, updated_at timestamp with time zone, last_message_content text, last_message_time timestamp with time zone, last_message_sender uuid, unread_count bigint, participant_1_name text, participant_1_avatar text, participant_2_name text, participant_2_avatar text, plant_title text, plant_image text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.participant_1,
    c.participant_2,
    c.plant_id,
    c.created_at,
    c.updated_at,
    lm.content as last_message_content,
    lm.message_created_at as last_message_time,
    lm.sender_id as last_message_sender,
    COALESCE(unread.count, 0) as unread_count,
    p1.name as participant_1_name,
    p1.avatar_url as participant_1_avatar,
    p2.name as participant_2_name,
    p2.avatar_url as participant_2_avatar,
    pl.title as plant_title,
    CASE 
      WHEN pl.images IS NOT NULL AND array_length(pl.images, 1) > 0 
      THEN pl.images[1] 
      ELSE NULL 
    END as plant_image
  FROM conversations c
  LEFT JOIN LATERAL (
    SELECT m.content, m.created_at as message_created_at, m.sender_id
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
  LEFT JOIN plants pl ON pl.id = c.plant_id
  WHERE (c.participant_1 = user_uuid OR c.participant_2 = user_uuid)
  ORDER BY COALESCE(lm.message_created_at, c.updated_at) DESC;
END;
$function$;