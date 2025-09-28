import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  plant_id?: string;
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
  plant_title?: string;
  plant_image?: string;
}

export const useRealtimeChat = (conversationId?: string) => {
  const { user } = useAuth();
  const { showMessageNotification, hasPermission } = useNotifications();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([]);

  // Hook para obtener conversaciones con caché
  const { data: conversations = [], isLoading: loading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: enrichedConversations, error } = await supabase
        .rpc('get_conversations_with_last_message', { user_uuid: user.id });

      if (error) {
        console.error('Error loading conversations:', error);
        throw error;
      }

      return enrichedConversations || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos en caché
    refetchOnWindowFocus: false,
    enabled: !!user
  });

  // Helper para invalidar las conversaciones en caché
  const refreshConversations = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations', user?.id] });
  };

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
              refreshConversations();
              
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
  }, [user, conversationId, refreshConversations, hasPermission, showMessageNotification]);

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
            refreshConversations();
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
            refreshConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async (content: string, otherUserId?: string, imageFile?: File, plantId?: string) => {
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

      // If no conversation exists, create one with plant_id
      if (!conversation_id && otherUserId && plantId) {
        // Check if a conversation already exists for this specific plant
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('plant_id', plantId)
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
                plant_id: plantId,
              },
            ])
            .select()
            .single();

          if (error) throw error;
          conversation_id = newConversation.id;
        }
      } else if (!conversation_id && otherUserId) {
        // Fallback for conversations without plant_id (legacy support)
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
        refreshConversations();
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