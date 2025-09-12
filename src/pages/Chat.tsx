import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { messages, sendMessage } = useRealtimeChat(conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name: string; avatar_url?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load other user information
  useEffect(() => {
    if (!user || !conversationId) return;

    const loadOtherUser = async () => {
      try {
        // Get conversation details
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .select('participant_1, participant_2')
          .eq('id', conversationId)
          .single();

        if (convError) {
          console.error('Error loading conversation:', convError);
          return;
        }

        // Determine the other user's ID
        const otherUserId = conversation.participant_1 === user.id 
          ? conversation.participant_2 
          : conversation.participant_1;

        // Get other user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, avatar_url')
          .eq('user_id', otherUserId)
          .single();

        if (profileError) {
          console.error('Error loading user profile:', profileError);
          setOtherUser({ name: 'Usuario' });
        } else {
          setOtherUser({ 
            name: profile.name || 'Usuario',
            avatar_url: profile.avatar_url
          });
        }
      } catch (error) {
        console.error('Error loading other user:', error);
        setOtherUser({ name: 'Usuario' });
      }
    };

    loadOtherUser();
  }, [user, conversationId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage);
      setNewMessage('');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-plant-subtle flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-plant-100 p-4 flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/messages')}
          className="p-2"
        >
          <ArrowLeft size={20} />
        </Button>
        
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.avatar_url || ""} />
          <AvatarFallback className="bg-plant-100 text-plant-700">
            {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div>
          <h1 className="font-semibold text-gray-900">{otherUser?.name || 'Usuario'}</h1>
          <p className="text-sm text-gray-500">En línea</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">💬</p>
              <p>No hay mensajes aún</p>
              <p className="text-sm">¡Envía el primer mensaje!</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                  message.sender_id === user.id
                    ? 'bg-plant-500 text-white'
                    : 'bg-white text-gray-900 border border-plant-100'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender_id === user.id
                      ? 'text-plant-100'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(message.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-plant-100 p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe tu mensaje..."
            className="flex-1 border-plant-200 focus:border-plant-400"
            disabled={sending}
            maxLength={1000}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newMessage.trim() || sending}
            className="px-4 bg-plant-500 hover:bg-plant-600"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
        <div className="text-xs text-gray-400 mt-1 text-right">
          {newMessage.length}/1000
        </div>
      </div>
    </div>
  );
};

export default Chat;