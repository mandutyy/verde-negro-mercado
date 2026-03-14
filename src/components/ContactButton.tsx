import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Check if conversation already exists for this plant
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('plant_id', plantId)
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`);
      } else {
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert([{
            participant_1: user.id,
            participant_2: sellerId,
            plant_id: plantId
          }])
          .select()
          .single();

        if (error) throw error;
        if (newConversation) {
          navigate(`/chat/${newConversation.id}`);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar la conversación. Inténtalo de nuevo.",
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