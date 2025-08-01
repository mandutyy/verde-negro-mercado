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
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
}

export const useRealtimeChat = (conversationId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const { data, error } = await (supabase as any)
        .from('conversations')
        .select('*')
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
      } else {
        setConversations((data as Conversation[]) || []);
      }
      setLoading(false);
    };

    loadConversations();
  }, [user]);

  // Load messages for specific conversation
  useEffect(() => {
    if (!user || !conversationId) return;

    const loadMessages = async () => {
      const { data, error } = await (supabase as any)
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages((data as Message[]) || []);
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
        (payload) => {
          const newConversation = payload.new as Conversation;
          if (
            newConversation.participant_1 === user.id ||
            newConversation.participant_2 === user.id
          ) {
            setConversations((prev) => [newConversation, ...prev]);
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
        (payload) => {
          const updatedConversation = payload.new as Conversation;
          if (
            updatedConversation.participant_1 === user.id ||
            updatedConversation.participant_2 === user.id
          ) {
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === updatedConversation.id ? updatedConversation : conv
              )
            );
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
        const { data: existingConversation } = await (supabase as any)
          .from('conversations')
          .select('*')
          .or(
            `and(participant_1.eq.${user.id},participant_2.eq.${otherUserId}),and(participant_1.eq.${otherUserId},participant_2.eq.${user.id})`
          )
          .maybeSingle();

        if (existingConversation) {
          conversation_id = (existingConversation as Conversation).id;
        } else {
          const { data: newConversation, error } = await (supabase as any)
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
          conversation_id = (newConversation as Conversation).id;
        }
      }

      if (!conversation_id) throw new Error('No conversation ID');

      const { error } = await (supabase as any).from('messages').insert([
        {
          conversation_id,
          sender_id: user.id,
          content: content.trim(),
        },
      ]);

      if (error) throw error;

      // Update conversation timestamp
      await (supabase as any)
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation_id);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  return {
    messages,
    conversations,
    loading,
    sendMessage,
  };
};