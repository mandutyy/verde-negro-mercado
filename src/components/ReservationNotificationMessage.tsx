import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ReservationNotificationMessageProps {
  reservationId: string;
  plantId: string;
  plantTitle: string;
  plantImage?: string;
  senderId: string;
  onStatusChange?: () => void;
}

const ReservationNotificationMessage: React.FC<ReservationNotificationMessageProps> = ({
  reservationId,
  plantId,
  plantTitle,
  plantImage,
  senderId,
  onStatusChange
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [isLoading, setIsLoading] = useState(false);
  const isSeller = user?.id !== senderId;

  const handleStatusUpdate = async (newStatus: 'accepted' | 'declined') => {
    if (!isSeller) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      setStatus(newStatus);
      onStatusChange?.();
      
      toast({
        title: newStatus === 'accepted' ? 'Reserva aceptada' : 'Reserva rechazada',
        description: newStatus === 'accepted' 
          ? 'Has aceptado la solicitud de reserva' 
          : 'Has rechazado la solicitud de reserva',
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la reserva",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-start gap-3 max-w-sm mx-auto">
      <div className="bg-[#1a3826] rounded-2xl p-4 w-full space-y-4">
        <p className="text-white font-bold text-center">Solicitud de Reserva</p>
        <div className="flex items-center gap-3">
          <div 
            className="w-16 h-16 rounded-lg bg-cover bg-center"
            style={{
              backgroundImage: plantImage ? `url("${plantImage}")` : 'none',
              backgroundColor: !plantImage ? '#264532' : undefined
            }}
          >
            {!plantImage && (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🌿
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">{plantTitle}</h3>
            <p className="text-[#96c5a9] text-sm">
              {isSeller 
                ? 'El usuario quiere reservar esta planta.' 
                : 'Has solicitado reservar esta planta.'}
            </p>
          </div>
        </div>
        
        {status === 'pending' && isSeller && (
          <div className="flex gap-3">
            <button 
              onClick={() => handleStatusUpdate('declined')}
              disabled={isLoading}
              className="flex-1 bg-gray-600/50 text-white rounded-full py-2 text-sm font-semibold hover:bg-gray-600/70 disabled:opacity-50"
            >
              Rechazar
            </button>
            <button 
              onClick={() => handleStatusUpdate('accepted')}
              disabled={isLoading}
              className="flex-1 bg-[#38e07b] text-[#122118] rounded-full py-2 text-sm font-semibold hover:bg-[#38e07b]/90 disabled:opacity-50"
            >
              Aceptar
            </button>
          </div>
        )}
        
        {status === 'accepted' && (
          <div className="text-center">
            <p className="text-[#38e07b] font-semibold">✓ Reserva Aceptada</p>
          </div>
        )}
        
        {status === 'declined' && (
          <div className="text-center">
            <p className="text-gray-400 font-semibold">✗ Reserva Rechazada</p>
          </div>
        )}
        
        {status === 'pending' && !isSeller && (
          <div className="text-center">
            <p className="text-[#96c5a9] text-sm">⏳ Esperando respuesta del vendedor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationNotificationMessage;
