import { Settings, Star, LogIn, Share, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('publicaciones');
  
  const handleShareApp = async () => {
    const shareData = {
      title: 'Plantify - Compra y vende plantas',
      text: '¡Descubre Plantify! La mejor app para comprar, vender e intercambiar plantas. ¡Únete a nuestra comunidad verde!',
      url: 'https://preview--verde-negro-mercado.lovable.app'
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      console.log('Web Share API failed, using fallback');
    }

    // Fallback: copiar al portapapeles
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace de la app se ha copiado al portapapeles. Compártelo con tus amigos.",
      });
    } catch (clipboardError) {
      // Si también falla el portapapeles, mostrar el enlace en un toast
      toast({
        title: "Comparte Plantify",
        description: `Copia este enlace: ${window.location.origin}`,
      });
    }
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#122118]">
        <header className="flex items-center justify-between p-4 pb-2">
          <div className="flex w-12 items-center justify-start">
            <button
              onClick={() => navigate(-1)}
              className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white hover:bg-[#1b3124] transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          </div>
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Perfil</h1>
          <div className="w-12"></div>
        </header>
        
        <div className="px-4 py-8 flex flex-col items-center justify-center">
          <Card className="bg-[#1b3124] border-[#366348] shadow-sm w-full max-w-sm">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-[#366348] rounded-full mx-auto flex items-center justify-center mb-4">
                  <LogIn size={32} className="text-[#38e07b]" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Inicia sesión
                </h2>
                <p className="text-[#96c5a9] text-sm">
                  Accede a tu cuenta para ver tu perfil y gestionar tus plantas
                </p>
              </div>
              
              <Button 
                className="w-full bg-[#38e07b] hover:bg-[#2dc76a] text-[#122118] font-bold"
                onClick={() => navigate('/auth')}
              >
                <LogIn size={16} className="mr-2" />
                Iniciar sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const plantImages = [
    'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1493120952221-2a1b63c9c4e5?w=400&h=300&fit=crop',
  ];

  const tabs = [
    { id: 'publicaciones', label: 'Publicaciones' },
    { id: 'ventas', label: 'Ventas' },
    { id: 'compras', label: 'Compras' },
  ];

  return (
    <div className="min-h-screen bg-[#122118] text-white font-[Spline_Sans,Noto_Sans,sans-serif]">
      {/* Header */}
      <header className="flex items-center justify-between p-4 pb-2">
        <div className="flex w-12 items-center justify-start">
          <button
            onClick={() => navigate(-1)}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white hover:bg-[#1b3124] transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Perfil
        </h1>
        <div className="flex w-12 items-center justify-end">
          <button 
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white hover:bg-[#1b3124] transition-colors"
            onClick={() => navigate('/edit-profile')}
          >
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="flex flex-col items-center p-4">
        <div 
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-24 mb-4"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face")`
          }}
        />
        <p className="text-white text-xl font-bold leading-tight tracking-[-0.015em] text-center">
          {user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario'}
        </p>
        <div className="flex items-center gap-1 text-[#96c5a9] text-sm mt-1">
          <Star size={16} className="text-[#f5d76e] fill-current" />
          <p className="font-bold">4.8 <span className="font-normal">(125)</span></p>
        </div>
        <p className="text-[#96c5a9] text-sm font-normal leading-normal text-center mt-2">
          120 seguidores · 100 seguidos
        </p>
        
        {/* Share App Button */}
        <div className="mt-4 w-full max-w-xs">
          <Button
            onClick={handleShareApp}
            className="w-full bg-[#264532] hover:bg-[#366348] text-white border border-[#38e07b] font-medium"
          >
            <Share size={16} className="mr-2" />
            Compartir app con un amigo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="pb-3">
        <div className="flex border-b border-[#366348] px-4 justify-around">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-colors ${
                activeTab === tab.id
                  ? 'border-b-[#38e07b] text-white'
                  : 'border-b-transparent text-[#96c5a9] hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                {tab.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-1 p-1 pb-32">
        {plantImages.map((image, index) => (
          <div
            key={index}
            className="w-full bg-center bg-no-repeat aspect-square bg-cover cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundImage: `url("${image}")` }}
            onClick={() => navigate(`/plant/${index + 1}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default Profile;