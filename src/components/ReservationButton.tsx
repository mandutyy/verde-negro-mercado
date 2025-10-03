import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReservationButtonProps {
  plantId: string;
  sellerId: string;
  sellerName?: string;
  plantTitle?: string;
  isDisabled?: boolean;
}

const ReservationButton: React.FC<ReservationButtonProps> = ({ 
  plantId, 
  sellerId, 
  sellerName,
  plantTitle,
  isDisabled = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleReservation = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user.id === sellerId) {
      toast({
        title: "No puedes reservar tu propia planta",
        description: "Este es tu propio anuncio",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Check if there's already a pending reservation
      const { data: existingReservation } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('plant_id', plantId)
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .maybeSingle();

      if (existingReservation) {
        toast({
          title: "Ya tienes una solicitud pendiente",
          description: "Ya has solicitado reservar esta planta",
          variant: "destructive",
        });
        return;
      }

      // Create reservation request
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .insert({
          plant_id: plantId,
          requester_id: user.id,
          seller_id: sellerId,
          message: `Solicitud de reserva para "${plantTitle || 'esta planta'}"`
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Get or create conversation
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('plant_id', plantId)
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
        .maybeSingle();

      let conversationId = existingConversation?.id;

      if (!conversationId) {
        const { data: newConversation, error: conversationError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: sellerId,
            plant_id: plantId
          })
          .select()
          .single();

        if (conversationError) throw conversationError;
        conversationId = newConversation.id;
      }

      // Send special reservation message in the chat
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: JSON.stringify({
            type: 'reservation_request',
            reservation_id: reservationData.id,
            plant_id: plantId,
            plant_title: plantTitle || 'esta planta'
          })
        });

      if (messageError) throw messageError;

      toast({
        title: "Solicitud enviada",
        description: `Tu solicitud de reserva ha sido enviada a ${sellerName || 'el vendedor'}`,
      });
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la solicitud de reserva. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleReservation}
      disabled={isLoading || isDisabled}
      className="text-base font-bold text-[#122118] bg-[#38e07b] rounded-full px-4 py-2 whitespace-nowrap hover:bg-[#38e07b]/90"
    >
      {isLoading ? 'Enviando...' : 'Solicitar Reserva'}
    </Button>
  );
};

export default ReservationButton;