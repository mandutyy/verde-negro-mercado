import { ArrowLeft, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { hasPermission, requestPermission, isSupported } = useNotifications();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Sync local state with actual permission status
  useEffect(() => {
    if (isSupported) {
      setNotificationsEnabled(hasPermission);
    }
  }, [hasPermission, isSupported]);

  const handleNotificationToggle = async (checked: boolean) => {
    if (!isSupported) {
      toast({
        title: "No soportado",
        description: "Las notificaciones no están disponibles en este dispositivo",
        variant: "destructive"
      });
      return;
    }

    if (checked) {
      const granted = await requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        toast({
          title: "¡Notificaciones activadas!",
          description: "Ahora recibirás notificaciones de nuevos mensajes",
        });
      } else {
        setNotificationsEnabled(false);
        toast({
          title: "Permisos denegados",
          description: "No se pudieron activar las notificaciones. Puedes habilitarlas desde la configuración del navegador.",
          variant: "destructive"
        });
      }
    } else {
      setNotificationsEnabled(false);
      toast({
        title: "Notificaciones desactivadas",
        description: "Ya no recibirás notificaciones de mensajes",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('delete-user');
      
      if (error) throw error;

      await signOut();
      
      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada permanentemente",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la cuenta",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-[#122118] justify-between">
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between p-4 pb-2">
          <div className="w-12">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white hover:bg-[#1b3124] transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Configuraciones
          </h1>
          <div className="flex w-12 items-center justify-end"></div>
        </header>

        {/* Content */}
        <div className="flex-grow p-4 space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-bold">Información Personal</h2>
            <button 
              onClick={() => navigate('/edit-profile')}
              className="flex items-center justify-between w-full text-left bg-[#1b3124] p-4 rounded-lg hover:bg-[#264532] transition-colors"
            >
              <span className="text-white">Editar Perfil</span>
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>

          {/* Preferencias */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-bold">Preferencias</h2>
            <div className="bg-[#1b3124] rounded-lg">
              <div className="flex items-center justify-between p-4 border-b border-[#264532]">
                <span className="text-white">Notificaciones</span>
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                  disabled={!isSupported}
                />
              </div>
              <button className="flex items-center justify-between w-full text-left p-4 hover:bg-[#264532] transition-colors rounded-b-lg">
                <span className="text-white">Privacidad y Seguridad</span>
                <ChevronRight size={20} className="text-white" />
              </button>
            </div>
          </div>

          {/* Cuenta */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-bold">Cuenta</h2>
            <div className="bg-[#1b3124] rounded-lg">
              <button className="flex items-center justify-between w-full text-left p-4 border-b border-[#264532] hover:bg-[#264532] transition-colors rounded-t-lg">
                <span className="text-white">Cambiar Contraseña</span>
                <ChevronRight size={20} className="text-white" />
              </button>
              <button 
                onClick={handleSignOut}
                className="flex items-center justify-between w-full text-left p-4 border-b border-[#264532] hover:bg-[#264532] transition-colors"
              >
                <span className="text-red-500">Cerrar Sesión</span>
                <LogOut size={20} className="text-red-500" />
              </button>
              <button 
                onClick={() => setShowDeleteDialog(true)}
                className="flex items-center justify-between w-full text-left p-4 hover:bg-[#264532] transition-colors rounded-b-lg"
              >
                <span className="text-red-500">Eliminar Cuenta</span>
                <Trash2 size={20} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Tu cuenta será eliminada permanentemente 
              del sistema junto con todos tus datos, plantas, mensajes y favoritos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar Cuenta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;