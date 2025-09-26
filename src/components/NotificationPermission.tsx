import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export const NotificationPermission = () => {
  const { isSupported, permission, requestPermission, hasPermission } = useNotifications();
  const { toast } = useToast();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        toast({
          title: "¡Notificaciones activadas!",
          description: "Ahora recibirás notificaciones de nuevos mensajes.",
        });
      } else {
        toast({
          title: "Permisos denegados",
          description: "No podrás recibir notificaciones de mensajes.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron configurar las notificaciones.",
        variant: "destructive"
      });
    } finally {
      setIsRequesting(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  if (hasPermission) {
    return (
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <Bell className="w-4 h-4 mr-2 text-green-600" />
          <CardTitle className="text-sm">Notificaciones activadas</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Recibirás notificaciones cuando lleguen nuevos mensajes.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (permission === 'denied') {
    return (
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <BellOff className="w-4 h-4 mr-2 text-red-600" />
          <CardTitle className="text-sm">Notificaciones desactivadas</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">
            Las notificaciones están bloqueadas. Puedes activarlas desde la configuración del navegador.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center">
          <Bell className="w-4 h-4 mr-2" />
          Notificaciones de mensajes
        </CardTitle>
        <CardDescription className="text-xs">
          Activa las notificaciones para no perderte ningún mensaje importante.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          size="sm" 
          onClick={handleRequestPermission}
          disabled={isRequesting}
          className="w-full"
        >
          {isRequesting ? 'Activando...' : 'Activar notificaciones'}
        </Button>
      </CardContent>
    </Card>
  );
};