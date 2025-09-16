import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  delivered_at?: string;
  status?: 'sent' | 'delivered' | 'read';
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations with last message info
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const { data, error } = await (supabase as any)
        .rpc('get_conversations_with_last_message', { user_uuid: user.id });

      if (error) {
        console.error('Error loading conversations:', error);
      } else {
        setConversations((data as Conversation[]) || []);
      }
      setLoading(false);
    };

    loadConversations();
  }, [user]);

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
            const { data } = await supabase.rpc('get_conversations_with_last_message', {
              user_uuid: user.id
            });
            if (data) {
              setConversations(data as Conversation[]);
            }
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
            const { data } = await supabase.rpc('get_conversations_with_last_message', {
              user_uuid: user.id
            });
            if (data) {
              setConversations(data as Conversation[]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async (content: string, otherUserId?: string) => {
    if (!user || !content.trim()) return;

    try {
      let conversation_id = conversationId;

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
          content: content.trim(),
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
        const { data } = await supabase.rpc('get_conversations_with_last_message', {
          user_uuid: user.id
        });
        if (data) {
          setConversations(data as Conversation[]);
        }
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