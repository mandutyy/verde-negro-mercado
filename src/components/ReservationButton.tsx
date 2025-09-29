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
      const { error } = await supabase
        .from('reservations')
        .insert({
          plant_id: plantId,
          requester_id: user.id,
          seller_id: sellerId,
          message: `Solicitud de reserva para "${plantTitle || 'esta planta'}"`
        });

      if (error) throw error;

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
      variant="outline"
      className="w-full"
      size="lg"
    >
      <Calendar className="mr-2 h-4 w-4" />
      {isLoading ? 'Enviando...' : 'Solicitar Reserva'}
    </Button>
  );
};

export default ReservationButton;