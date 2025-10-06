import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Camera, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ReservationButton from '@/components/ReservationButton';
import ReservationNotificationMessage from '@/components/ReservationNotificationMessage';

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { messages, sendMessage, markMessagesAsRead } = useRealtimeChat(conversationId);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<{ name: string; avatar_url?: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [plant, setPlant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Mark messages as read when conversation opens
  useEffect(() => {
    if (conversationId && user) {
      markMessagesAsRead(conversationId);
    }
  }, [conversationId, user]);

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
        const { data: conversationData, error: convError } = await supabase
          .from('conversations')
          .select('participant_1, participant_2, plant_id')
          .eq('id', conversationId)
          .single();

        if (convError) {
          console.error('Error loading conversation:', convError);
          return;
        }

        setConversation(conversationData);

        // Determine the other user's ID
        const otherUserId = conversationData.participant_1 === user.id 
          ? conversationData.participant_2 
          : conversationData.participant_1;

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

        // Fetch plant information if this conversation is about a specific plant
        if (conversationData.plant_id) {
          const { data: plantData } = await supabase
            .from('plants')
            .select('*')
            .eq('id', conversationData.plant_id)
            .maybeSingle();
          
          setPlant(plantData);
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
    if ((!newMessage.trim() && !selectedImage) || sending) return;

    setSending(true);
    try {
      await sendMessage(newMessage, undefined, selectedImage || undefined);
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no puede ser mayor a 5MB",
        variant: "destructive",
      });
      return;
    }

    // Set selected image and create preview
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  return (
    <div className="relative flex h-screen w-full flex-col bg-[#122118] justify-between">
      <div className="flex-grow">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center bg-[#122118]/80 backdrop-blur-sm p-4 pb-2 justify-between gap-4">
          <button
            onClick={() => navigate('/messages')}
            className="text-white flex size-10 items-center justify-center"
          >
            <ArrowLeft size={24} />
          </button>
          
          <div className="flex items-center gap-3 mr-auto w-full">
            <div className="flex items-center gap-3 w-full">
              {/* Foto del producto - cuadrada */}
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-lg w-10 h-10 shrink-0 cursor-pointer"
                style={{
                  backgroundImage: plant?.images?.[0] 
                    ? `url("${plant.images[0]}")` 
                    : 'none',
                  backgroundColor: !plant?.images?.[0] ? '#264532' : undefined
                }}
                onClick={() => plant?.id && navigate(`/plant/${plant.id}`)}
              >
                {!plant?.images?.[0] && (
                  <div className="w-full h-full flex items-center justify-center text-xl">
                    🌿
                  </div>
                )}
              </div>
              
              {/* Nombre del anuncio */}
              <div 
                className="flex-grow cursor-pointer"
                onClick={() => plant?.id && navigate(`/plant/${plant.id}`)}
              >
                <h2 className="text-white text-base font-bold leading-tight tracking-[-0.015em] truncate">
                  {plant?.title || otherUser?.name || 'Conversación'}
                </h2>
              </div>

              {plant && user?.id !== plant.user_id && (
                <div className="flex-shrink-0">
                  <ReservationButton
                    plantId={plant.id}
                    sellerId={plant.user_id}
                    sellerName={otherUser?.name}
                    plantTitle={plant.title}
                    isDisabled={false}
                  />
                </div>
              )}
              
              {/* Avatar del usuario - circular */}
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10 shrink-0"
                style={{
                  backgroundImage: otherUser?.avatar_url 
                    ? `url("${otherUser.avatar_url}")` 
                    : 'none',
                  backgroundColor: !otherUser?.avatar_url ? '#264532' : undefined
                }}
              >
                {!otherUser?.avatar_url && (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded-full bg-[#264532]">
                    {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>

        {/* Messages */}
        <div className="p-4 space-y-6 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-[#96c5a9]">
                <p className="text-lg mb-2">💬</p>
                <p>No hay mensajes aún</p>
                <p className="text-sm">¡Envía el primer mensaje!</p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.sender_id === user.id;
              
              // Check if this is a reservation notification message
              let reservationData = null;
              try {
                const parsed = JSON.parse(message.content);
                if (parsed.type === 'reservation_request') {
                  reservationData = parsed;
                }
              } catch (e) {
                // Not a JSON message, treat as regular message
              }

              // Render reservation notification
              if (reservationData) {
                return (
                  <div key={message.id}>
                    <ReservationNotificationMessage
                      reservationId={reservationData.reservation_id}
                      plantId={reservationData.plant_id}
                      plantTitle={reservationData.plant_title}
                      plantImage={plant?.images?.[0]}
                      senderId={message.sender_id}
                      onStatusChange={() => {
                        // Refresh plant data when reservation status changes
                        if (conversation?.plant_id) {
                          supabase
                            .from('plants')
                            .select('*')
                            .eq('id', conversation.plant_id)
                            .maybeSingle()
                            .then(({ data }) => setPlant(data));
                        }
                      }}
                    />
                  </div>
                );
              }

              // Render regular message
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 ${
                    isOwnMessage ? 'justify-end ml-auto' : ''
                  } max-w-[80%]`}
                >
                  {!isOwnMessage && (
                    <div 
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 shrink-0"
                      style={{
                        backgroundImage: otherUser?.avatar_url 
                          ? `url("${otherUser.avatar_url}")` 
                          : 'none',
                        backgroundColor: !otherUser?.avatar_url ? '#264532' : undefined
                      }}
                    >
                      {!otherUser?.avatar_url && (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded-full bg-[#264532]">
                          {otherUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`flex flex-1 flex-col gap-1.5 ${
                    isOwnMessage ? 'items-end' : 'items-start'
                  }`}>
                    {message.content && (
                      <div
                        className={`text-base font-normal leading-normal flex max-w-[360px] rounded-2xl px-4 py-3 ${
                          isOwnMessage
                            ? 'rounded-br-lg bg-[#38e07b] text-[#122118]'
                            : 'rounded-bl-lg bg-[#264532] text-white'
                        }`}
                      >
                        {message.content}
                      </div>
                    )}
                    
                    {message.image_url && (
                      <div className="rounded-2xl overflow-hidden max-w-xs w-full">
                        <img 
                          src={message.image_url} 
                          alt="Imagen compartida"
                          className="w-full h-auto object-cover aspect-[4/3]"
                          onError={(e) => {
                            console.error('Error loading image:', message.image_url);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className={`flex items-center gap-1 text-xs ${
                      isOwnMessage ? 'text-[#96c5a9]' : 'text-[#96c5a9]'
                    }`}>
                      <span>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isOwnMessage && (
                        <div className="flex items-center ml-1">
                          {message.status === 'read' ? (
                            <CheckCheck size={12} className="text-[#34b7f1]" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck size={12} className="text-[#96c5a9]" />
                          ) : (
                            <Check size={12} className="text-[#96c5a9]" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="sticky bottom-0 bg-[#122118] pt-1">
        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Vista previa" 
                className="w-20 h-20 object-cover rounded-lg border-2 border-[#38e07b]"
              />
              <button
                onClick={removeSelectedImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center px-4 py-3 gap-3">
          <div className="flex w-full flex-1 items-center rounded-full bg-[#264532] h-12 px-2">
            <form onSubmit={handleSendMessage} className="flex w-full items-center">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-full text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-[#96c5a9] px-2 text-base font-normal leading-normal"
                disabled={sending}
              />
            </form>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending}
              className="flex items-center justify-center p-2 text-[#96c5a9] hover:text-white"
            >
              <Camera size={20} />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={(!newMessage.trim() && !selectedImage) || sending}
            className="flex-shrink-0 flex items-center justify-center size-12 rounded-full bg-[#38e07b] text-[#122118] hover:bg-[#38e07b]/90 disabled:opacity-50"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#122118]"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;