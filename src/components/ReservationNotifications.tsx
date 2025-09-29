import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, Calendar, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Reservation {
  id: string;
  plant_id: string;
  requester_id: string;
  status: string;
  message: string;
  created_at: string;
  profiles?: {
    name: string;
    avatar_url: string;
  };
  plants?: {
    title: string;
    images: string[];
  };
}

const ReservationNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchReservations = async () => {
      try {
        // Fetch reservations with manual profile and plant lookups
        const { data: reservationsData, error } = await supabase
          .from('reservations')
          .select('*')
          .eq('seller_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch profiles and plants separately
        const enrichedReservations = await Promise.all(
          (reservationsData || []).map(async (reservation) => {
            const [profileData, plantData] = await Promise.all([
              supabase
                .from('profiles')
                .select('name, avatar_url')
                .eq('user_id', reservation.requester_id)
                .maybeSingle(),
              supabase
                .from('plants')
                .select('title, images')
                .eq('id', reservation.plant_id)
                .maybeSingle()
            ]);

            return {
              ...reservation,
              profiles: profileData.data,
              plants: plantData.data
            };
          })
        );

        setReservations(enrichedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('reservations-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reservations',
          filter: `seller_id=eq.${user.id}`
        },
        () => {
          fetchReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleReservationResponse = async (reservationId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId);

      if (error) throw error;

      setReservations(prev => prev.filter(r => r.id !== reservationId));

      toast({
        title: status === 'accepted' ? 'Reserva aceptada' : 'Reserva rechazada',
        description: status === 'accepted' 
          ? 'La planta ha sido marcada como reservada'
          : 'La solicitud de reserva ha sido rechazada',
      });
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo procesar la respuesta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center text-muted-foreground">Cargando notificaciones...</div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No tienes solicitudes de reserva
        </h3>
        <p className="text-muted-foreground">
          Cuando alguien solicite reservar tus plantas, aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">
        Solicitudes de Reserva ({reservations.length})
      </h2>
      
      {reservations.map((reservation) => {
        const requesterName = reservation.profiles?.name || `Usuario ${reservation.requester_id.slice(-4)}`;
        const plantTitle = reservation.plants?.title || 'Planta';
        const plantImage = reservation.plants?.images?.[0];
        
        return (
          <Card key={reservation.id} className="border border-border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3 text-base">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={reservation.profiles?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                    {requesterName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{requesterName}</p>
                  <p className="text-sm text-muted-foreground">quiere reservar tu planta</p>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(reservation.created_at).toLocaleDateString()}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                {plantImage && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted border border-border/50">
                    <img 
                      src={plantImage} 
                      alt={`Foto de ${plantTitle}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-foreground">{plantTitle}</p>
                  <p className="text-sm text-muted-foreground">{reservation.message}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReservationResponse(reservation.id, 'accepted')}
                  className="flex-1"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Aceptar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReservationResponse(reservation.id, 'declined')}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ReservationNotifications;