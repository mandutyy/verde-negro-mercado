import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import LocationMap from '@/components/LocationMap';
import { Camera, MapPin, User, FileText, Save, ArrowLeft, Search, Upload, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { spanishCities, searchSpanishCities } from '@/data/spanishCities';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const [formData, setFormData] = useState({
    name: 'Juan Díaz',
    location: 'Madrid, España',
    bio: '🌱 Amante de las plantas desde siempre. Me encanta intercambiar y ayudar a otros con sus jardines urbanos.',
    avatar: '',
    coordinates: [-3.7038, 40.4168] as [number, number]
  });
  const [showMap, setShowMap] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const [searchResults, setSearchResults] = useState<typeof spanishCities>([]);
  const handleSave = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para guardar los cambios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          name: formData.name,
          location: formData.location,
          bio: formData.bio,
          avatar_url: formData.avatar,
          coordinates: formData.coordinates
        });

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente."
      });
      navigate('/profile');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleLocationSelect = (location: {
    name: string;
    coordinates: [number, number];
  }) => {
    setFormData(prev => ({
      ...prev,
      location: location.name,
      coordinates: location.coordinates
    }));
    setShowMap(false);
    setLocationSearch('');
    setSearchResults([]);
  };
  const handleLocationSearch = (query: string) => {
    setLocationSearch(query);
    if (query.length > 2) {
      const results = searchSpanishCities(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };
  const selectCityFromSearch = (city: typeof spanishCities[0]) => {
    handleLocationSelect({
      name: `${city.name}, ${city.region}`,
      coordinates: city.coordinates as [number, number]
    });
  };

  const uploadAvatar = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para subir una foto.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar: data.publicUrl }));
      
      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente."
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la foto.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatar(file);
      setShowPhotoOptions(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      setShowCamera(true);
      setShowPhotoOptions(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Error",
        description: "No se pudo acceder a la cámara.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          uploadAvatar(file);
        }
      }, 'image/jpeg', 0.8);
      
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#122118] justify-between" style={{ fontFamily: '"Spline Sans", "Noto Sans", sans-serif' }}>
      <div className="flex-grow">
        {/* Header */}
        <header className="flex items-center bg-[#122118] p-4 pb-2 justify-between sticky top-0 z-10">
          <Button 
            onClick={() => navigate('/profile')} 
            className="text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/10 transition-colors bg-transparent border-none p-0"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">
            Editar perfil
          </h2>
        </header>

        {/* Main Content */}
        <main className="p-4 flex flex-col gap-6">
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32"
                style={{
                  backgroundImage: formData.avatar 
                    ? `url("${formData.avatar}")` 
                    : `url("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80")`
                }}
              />
              <Sheet open={showPhotoOptions} onOpenChange={setShowPhotoOptions}>
                <SheetTrigger asChild>
                  <button className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Camera className="text-white text-3xl" size={32} />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto bg-[#1b3124] border-[#264532]">
                  <SheetHeader>
                    <SheetTitle className="text-white">Cambiar foto de perfil</SheetTitle>
                    <SheetDescription className="text-[#96c5a9]">
                      Elige cómo quieres actualizar tu foto
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6 pb-6">
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-16 text-left justify-start bg-[#264532] hover:bg-[#2a4d36] text-white border-[#264532]"
                      variant="outline"
                    >
                      <Upload size={24} className="mr-4" />
                      <div>
                        <div className="font-medium">Seleccionar de galería</div>
                        <div className="text-sm text-[#96c5a9]">Elige una foto existente</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={startCamera} 
                      className="h-16 text-left justify-start bg-[#264532] hover:bg-[#2a4d36] text-white border-[#264532]"
                      variant="outline"
                    >
                      <Video size={24} className="mr-4" />
                      <div>
                        <div className="font-medium">Tomar foto</div>
                        <div className="text-sm text-[#96c5a9]">Usa la cámara para tomar una nueva foto</div>
                      </div>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <Button 
              onClick={() => setShowPhotoOptions(true)}
              className="text-[#38e07b] bg-transparent hover:text-[#52f091] transition-colors border-none text-base font-bold leading-normal tracking-[0.015em]"
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Cambiar foto de perfil'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4">
            {/* Name Field */}
            <label className="flex flex-col gap-2">
              <p className="text-white text-sm font-medium leading-normal">Nombre</p>
              <Input 
                value={formData.name} 
                onChange={e => handleInputChange('name', e.target.value)}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-[#38e07b] border-none bg-[#264532] h-14 placeholder:text-[#96c5a9] px-4 text-base font-normal leading-normal"
              />
            </label>

            {/* Username Field */}
            <label className="flex flex-col gap-2">
              <p className="text-white text-sm font-medium leading-normal">Nombre de usuario</p>
              <Input 
                value={`@${formData.name.toLowerCase().replace(' ', '')}`}
                disabled
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-[#38e07b] border-none bg-[#264532] h-14 placeholder:text-[#96c5a9] px-4 text-base font-normal leading-normal opacity-60"
              />
            </label>

            {/* Bio Field */}
            <label className="flex flex-col gap-2">
              <p className="text-white text-sm font-medium leading-normal">Bio</p>
              <Textarea 
                value={formData.bio}
                onChange={e => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos un poco sobre ti y tu amor por las plantas..."
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-[#38e07b] border-none bg-[#264532] min-h-36 placeholder:text-[#96c5a9] p-4 text-base font-normal leading-normal"
              />
            </label>

            {/* Location Field */}
            <label className="flex flex-col gap-2">
              <p className="text-white text-sm font-medium leading-normal">Ubicación</p>
              <div className="relative">
                <Input 
                  placeholder="Ej. Madrid, España"
                  value={locationSearch || formData.location}
                  onChange={e => handleLocationSearch(e.target.value)}
                  className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-white focus:outline-0 focus:ring-2 focus:ring-[#38e07b] border-none bg-[#264532] h-14 placeholder:text-[#96c5a9] px-4 text-base font-normal leading-normal"
                />
                
                {/* Search Results */}
                {searchResults.length > 0 && locationSearch && (
                  <div className="absolute z-50 w-full mt-1 bg-[#264532] border border-[#38e07b]/30 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((city, index) => (
                      <button 
                        key={index} 
                        onClick={() => selectCityFromSearch(city)} 
                        className="w-full text-left px-4 py-2 hover:bg-[#38e07b]/10 transition-colors border-b border-[#38e07b]/20 last:border-b-0 flex items-center gap-2 text-white"
                      >
                        <MapPin size={14} className="text-[#96c5a9]" />
                        <div>
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-[#96c5a9]">{city.region}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </label>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#122118] sticky bottom-0 p-4 border-t border-[#264532]">
        <div className="flex gap-4 justify-end">
          <Button 
            onClick={() => navigate('/profile')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-transparent text-white text-base font-bold leading-normal tracking-[0.015em] border-2 border-[#264532] hover:bg-[#264532] transition-colors"
          >
            <span className="truncate">Cancelar</span>
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="flex flex-1 sm:flex-none min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-6 bg-[#38e07b] text-[#122118] text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#32c96e] transition-colors"
          >
            <span className="truncate">{loading ? 'Guardando...' : 'Guardar cambios'}</span>
          </Button>
        </div>
      </footer>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-[#1b3124] rounded-lg p-6 m-4 max-w-md w-full border border-[#264532]">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2 text-white">Tomar foto</h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover rounded-lg bg-[#264532]"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={stopCamera} 
                className="flex-1 bg-transparent border-2 border-[#264532] text-white hover:bg-[#264532]"
              >
                Cancelar
              </Button>
              <Button 
                onClick={capturePhoto} 
                className="flex-1 bg-[#38e07b] text-[#122118] hover:bg-[#32c96e]"
              >
                <Camera size={16} className="mr-2" />
                Capturar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default EditProfile;