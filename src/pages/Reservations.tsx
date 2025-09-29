import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import ReservationNotifications from '@/components/ReservationNotifications';
import { useAuth } from '@/hooks/useAuth';

const Reservations = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <Header title="Reservas" />
        <div className="flex items-center justify-center py-16">
          <div className="text-muted-foreground">Cargando...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header title="Reservas" />
      <div className="p-4">
        <ReservationNotifications />
      </div>
    </div>
  );
};

export default Reservations;