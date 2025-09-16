import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { MessageCircle, Search, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

const Messages = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading } = useRealtimeChat();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header title="Mensajes" />
        <div className="flex items-center justify-center py-16">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredConversations = conversations.filter(conversation => {
    const isUser1 = conversation.participant_1 === user.id;
    const otherUserId = isUser1 ? conversation.participant_2 : conversation.participant_1;
    const otherUserName = isUser1 ? conversation.participant_2_name : conversation.participant_1_name;
    const userName = otherUserName || `Usuario ${otherUserId.slice(-4)}`;
    return userName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="flex items-center bg-background p-4 pb-2 justify-between border-b">
        <div className="flex w-12 items-center justify-start">
          <Button variant="ghost" size="icon" className="h-12 w-12" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
        <h2 className="text-foreground text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Mensajes
        </h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex w-full items-stretch rounded-xl h-12">
          <div className="flex border-none bg-muted items-center justify-center pl-4 rounded-l-xl border-r-0">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input 
            placeholder="Buscar" 
            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-foreground focus:outline-0 focus:ring-0 border-none bg-muted focus:border-none h-full placeholder:text-muted-foreground px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>
      </div>

      {/* Conversations List */}
      <div>
        {filteredConversations.length > 0 ? (
          <div>
            {filteredConversations.map(conversation => {
              const isUser1 = conversation.participant_1 === user.id;
              const otherUserId = isUser1 ? conversation.participant_2 : conversation.participant_1;
              const otherUserName = isUser1 ? conversation.participant_2_name : conversation.participant_1_name;
              const otherUserAvatar = isUser1 ? conversation.participant_2_avatar : conversation.participant_1_avatar;
              const userName = otherUserName || `Usuario ${otherUserId.slice(-4)}`;
              const lastMessage = conversation.last_message_content || 'Conversación iniciada';
              const unreadCount = conversation.unread_count || 0;
              
              // Format last message time
              let timeDisplay = '';
              if (conversation.last_message_time) {
                const messageDate = new Date(conversation.last_message_time);
                const now = new Date();
                const isToday = messageDate.toDateString() === now.toDateString();
                
                if (isToday) {
                  timeDisplay = messageDate.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  });
                } else {
                  timeDisplay = messageDate.toLocaleDateString();
                }
              }

              return (
                <div 
                  key={conversation.id} 
                  className="flex items-center gap-4 bg-background px-4 min-h-[72px] py-2 border-b border-border hover:bg-muted/50 transition-colors cursor-pointer relative" 
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={otherUserAvatar || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {userName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-foreground text-base font-medium leading-normal line-clamp-1">
                        {userName}
                      </p>
                      {timeDisplay && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {timeDisplay}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground text-sm font-normal leading-normal line-clamp-1 flex-1">
                        {!conversation.last_message_content && conversation.last_message_sender ? (
                          <span className="flex items-center gap-1">
                            📷 Imagen
                          </span>
                        ) : (
                          lastMessage
                        )}
                      </p>
                      {unreadCount > 0 && (
                        <div className="bg-primary text-primary-foreground rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs font-medium ml-2">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <MessageCircle size={48} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Sin mensajes aún
            </h3>
            <p className="text-muted-foreground max-w-sm">
              Cuando contactes con otros usuarios, tus conversaciones aparecerán aquí
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;