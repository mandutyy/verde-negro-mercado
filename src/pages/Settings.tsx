import { ArrowLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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
                  onCheckedChange={setNotificationsEnabled}
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
                className="flex items-center justify-between w-full text-left p-4 hover:bg-[#264532] transition-colors rounded-b-lg"
              >
                <span className="text-red-500">Cerrar Sesión</span>
                <LogOut size={20} className="text-red-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;