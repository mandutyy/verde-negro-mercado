
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MessageCircle, Send } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

const Messages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading } = useRealtimeChat();
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-plant-subtle pb-20">
        <Header title="Mensajes" />
        <div className="flex items-center justify-center py-16">
          <div className="text-plant-600">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Mensajes" />
      
      <div className="px-4 py-4">
        {conversations.length > 0 ? (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const otherUserId = conversation.participant_1 === user.id 
                ? conversation.participant_2 
                : conversation.participant_1;
              
              return (
                <div
                  key={conversation.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-plant-100 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-plant-100 text-plant-700">
                          {otherUserId.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate">
                          Usuario {otherUserId.slice(-4)}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(conversation.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        Conversación iniciada
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-plant-100 p-4 rounded-full mb-4">
              <MessageCircle size={48} className="text-plant-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sin mensajes aún
            </h3>
            <p className="text-gray-600 max-w-sm">
              Cuando contactes con otros usuarios, tus conversaciones aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
