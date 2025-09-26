import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useNotifications } from './useNotifications';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  delivered_at?: string;
  status?: 'sent' | 'delivered' | 'read';
  image_url?: string;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  last_message_content?: string;
  last_message_time?: string;
  last_message_sender?: string;
  unread_count: number;
  participant_1_name?: string;
  participant_1_avatar?: string;
  participant_2_name?: string;
  participant_2_avatar?: string;
}

export const useRealtimeChat = (conversationId?: string) => {
  const { user } = useAuth();
  const { showMessageNotification, hasPermission } = useNotifications();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to refresh conversations with last message, unread count, and profiles
  const refreshConversations = async () => {
    if (!user) return;
    try {
      // 1) Base conversations for current user
      const { data: convs, error: convErr } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`);

      if (convErr) {
        console.error('Error loading conversations:', convErr);
        setLoading(false);
        return;
      }

      if (!convs || convs.length === 0) {
        setConversations([]);
        setLoading(false);
        return;
      }

      const convIds = convs.map((c) => c.id);
      const otherIds = convs.map((c) => (c.participant_1 === user.id ? c.participant_2 : c.participant_1));
      
      // 2) Latest messages across these conversations
      const { data: msgs } = await supabase
        .from('messages')
        .select('id,conversation_id,content,created_at,sender_id,read_at,delivered_at,status,image_url')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });

      const lastByConv = new Map<string, Message>();
      msgs?.forEach((m) => {
        if (!lastByConv.has(m.conversation_id)) {
          lastByConv.set(m.conversation_id, m as unknown as Message);
        }
      });

      // 3) Unread counts for current user
      const { data: unreadMsgs } = await supabase
        .from('messages')
        .select('id,conversation_id')
        .in('conversation_id', convIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      const unreadCountByConv = new Map<string, number>();
      unreadMsgs?.forEach((m: any) => {
        unreadCountByConv.set(m.conversation_id, (unreadCountByConv.get(m.conversation_id) || 0) + 1);
      });

      // 4) Profiles for the "other" user in each conversation
      const uniqueOtherIds = Array.from(new Set(otherIds));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id,name,avatar_url')
        .in('user_id', uniqueOtherIds);

      const profileByUserId = new Map<string, { name?: string; avatar_url?: string }>();
      profiles?.forEach((p: any) => profileByUserId.set(p.user_id, { name: p.name, avatar_url: p.avatar_url }));

      // 5) Merge all info and sort by last message time (fallback to updated_at)
      const enriched: Conversation[] = convs.map((c: any) => {
        const last = lastByConv.get(c.id);
        const otherUserId = c.participant_1 === user.id ? c.participant_2 : c.participant_1;
        const otherProfile = profileByUserId.get(otherUserId);
        return {
          id: c.id,
          participant_1: c.participant_1,
          participant_2: c.participant_2,
          created_at: c.created_at,
          updated_at: c.updated_at,
          last_message_content: last?.content,
          last_message_time: last?.created_at,
          last_message_sender: last?.sender_id,
          unread_count: unreadCountByConv.get(c.id) || 0,
          participant_1_name: profileByUserId.get(c.participant_1)?.name,
          participant_1_avatar: profileByUserId.get(c.participant_1)?.avatar_url,
          participant_2_name: profileByUserId.get(c.participant_2)?.name,
          participant_2_avatar: profileByUserId.get(c.participant_2)?.avatar_url,
        };
      }).sort((a, b) => {
        const aTime = a.last_message_time ? new Date(a.last_message_time).getTime() : new Date(a.updated_at).getTime();
        const bTime = b.last_message_time ? new Date(b.last_message_time).getTime() : new Date(b.updated_at).getTime();
        return bTime - aTime;
      });

      setConversations(enriched);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load conversations
  useEffect(() => {
    if (!user) return;
    refreshConversations();
  }, [user]);

  // Inbox realtime: refresh when any new message arrives for user's conversations
  useEffect(() => {
    if (!user || conversationId) return;

    const channel = supabase
      .channel('messages-inbox')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload) => {
          try {
            const msg = payload.new as Message;
            const { data } = await supabase
              .from('conversations')
              .select('participant_1, participant_2')
              .eq('id', msg.conversation_id)
              .single();
            if (data && (data.participant_1 === user.id || data.participant_2 === user.id)) {
              await refreshConversations();
              
              // Show notification if the message is from another user and we have permission
              if (msg.sender_id !== user.id && hasPermission) {
                // Get sender profile for notification
                const { data: senderProfile } = await supabase
                  .from('profiles')
                  .select('name')
                  .eq('user_id', msg.sender_id)
                  .single();
                
                const senderName = senderProfile?.name || 'Usuario';
                const messageContent = msg.image_url ? '📸 Imagen' : msg.content;
                showMessageNotification(senderName, messageContent, msg.conversation_id);
              }
            }
          } catch (e) {
            console.error('Error handling inbox realtime message:', e);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  // Load messages for specific conversation and mark as read
  useEffect(() => {
    if (!user || !conversationId) return;

    const loadMessages = async () => {
      try {
        // Load messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
        } else {
          setMessages((data as Message[]) || []);
          
          // Mark messages as read
          await supabase.rpc('mark_messages_as_read', {
            conversation_uuid: conversationId,
            user_uuid: user.id
          });
        }
      } catch (error) {
        console.error('Error in loadMessages:', error);
      }
    };

    loadMessages();
  }, [user, conversationId]);

  // Set up realtime subscription for messages
  useEffect(() => {
    if (!user || !conversationId) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, conversationId]);

  // Set up realtime subscription for conversations
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        async (payload) => {
          const newConversation = payload.new as any;
          if (
            newConversation.participant_1 === user.id ||
            newConversation.participant_2 === user.id
          ) {
            // Reload conversations to get the full details
            await refreshConversations();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        async (payload) => {
          const updatedConversation = payload.new as any;
          if (
            updatedConversation.participant_1 === user.id ||
            updatedConversation.participant_2 === user.id
          ) {
            // Reload conversations to get the full details
            await refreshConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async (content: string, otherUserId?: string, imageFile?: File) => {
    if (!user || (!content.trim() && !imageFile)) return;

    try {
      let conversation_id = conversationId;
      let image_url = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(fileName);
          
        image_url = publicUrl;
      }

      // If no conversation exists, create one
      if (!conversation_id && otherUserId) {
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .or(
            `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
          )
          .maybeSingle();

        if (existingConversation) {
          conversation_id = existingConversation.id;
        } else {
          const { data: newConversation, error } = await supabase
            .from('conversations')
            .insert([
              {
                participant_1: user.id,
                participant_2: otherUserId,
              },
            ])
            .select()
            .single();

          if (error) throw error;
          conversation_id = newConversation.id;
        }
      }

      if (!conversation_id) throw new Error('No conversation ID');

      const { error } = await supabase.from('messages').insert([
        {
          conversation_id,
          sender_id: user.id,
          content: content.trim() || '',
          image_url,
        },
      ]);

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
        
      // Reload conversations to update the UI
      if (!conversationId) {
        await refreshConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    if (!user) return;
    
    try {
      await supabase.rpc('mark_messages_as_read', {
        conversation_uuid: conversationId,
        user_uuid: user.id
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    markMessagesAsRead,
  };
};