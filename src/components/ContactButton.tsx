import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { useToast } from '@/components/ui/use-toast';

interface ContactButtonProps {
  plantId: string;
  sellerId: string;
  sellerName?: string;
  plantTitle?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({ 
  plantId, 
  sellerId, 
  sellerName,
  plantTitle 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sendMessage } = useRealtimeChat();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "No puedes contactarte contigo mismo",
        description: "Este es tu propio anuncio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const initialMessage = `Hola! Estoy interesado en tu anuncio "${plantTitle || 'este producto'}". ¿Podrías darme más información?`;
      
      await sendMessage(initialMessage, sellerId, undefined, plantId);
      
      toast({
        title: "Mensaje enviado",
        description: `Le has escrito a ${sellerName || 'el vendedor'}`,
      });
      
      // Navigate to messages to see the conversation
      navigate('/messages');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleContact}
      disabled={isLoading}
      className="w-full"
      size="lg"
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {isLoading ? 'Enviando...' : 'Contactar vendedor'}
    </Button>
  );
};

export default ContactButton;