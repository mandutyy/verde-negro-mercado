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
const EditProfile = () => {
  const navigate = useNavigate();
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
    setLoading(true);
    try {
      // For now, we'll simulate a user ID since auth isn't implemented yet
      const userId = 'temp-user-id'; // This should be auth.uid() when authentication is added
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
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
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `temp-user-id/${fileName}`; // Use auth.uid() when auth is implemented

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
  return <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <div className="flex items-center justify-between p-4 bg-white border-b border-plant-200">
        <Button variant="ghost" size="sm" onClick={() => navigate('/profile')} className="text-plant-700">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-lg font-semibold text-plant-800">Editar Perfil</h1>
        <div className="w-10" />
      </div>
      
      <div className="px-4 py-6 space-y-6">
        {/* Profile Photo Section */}
        <Card className="border-plant-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-plant-800">
              <Camera size={20} />
              Foto de perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="bg-plant-100 text-plant-700 text-2xl font-semibold">
                  {formData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Sheet open={showPhotoOptions} onOpenChange={setShowPhotoOptions}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="border-plant-300 text-plant-600" disabled={uploading}>
                    <Camera size={16} className="mr-2" />
                    {uploading ? 'Subiendo...' : 'Cambiar foto'}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-auto">
                  <SheetHeader>
                    <SheetTitle>Cambiar foto de perfil</SheetTitle>
                    <SheetDescription>
                      Elige cómo quieres actualizar tu foto
                    </SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-6 pb-6">
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      className="h-16 text-left justify-start"
                      variant="outline"
                    >
                      <Upload size={24} className="mr-4" />
                      <div>
                        <div className="font-medium">Seleccionar de galería</div>
                        <div className="text-sm text-muted-foreground">Elige una foto existente</div>
                      </div>
                    </Button>
                    <Button 
                      onClick={startCamera} 
                      className="h-16 text-left justify-start"
                      variant="outline"
                    >
                      <Video size={24} className="mr-4" />
                      <div>
                        <div className="font-medium">Tomar foto</div>
                        <div className="text-sm text-muted-foreground">Usa la cámara para tomar una nueva foto</div>
                      </div>
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card className="border-plant-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-plant-800">
              <User size={20} />
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-plant-700 font-medium">
                Nombre completo
              </Label>
              <Input id="name" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="border-plant-200 focus:border-plant-400" placeholder="Tu nombre completo" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="text-plant-700 font-medium flex items-center gap-2">
                <MapPin size={16} />
                Ubicación
              </Label>
              
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input id="location" placeholder="Buscar ciudad..." value={locationSearch} onChange={e => handleLocationSearch(e.target.value)} className="pl-10 border-plant-200 focus:border-plant-400" />
                
                {/* Sugerencias de búsqueda */}
                {searchResults.length > 0 && <div className="absolute z-50 w-full mt-1 bg-white border border-plant-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {searchResults.map((city, index) => <button key={index} onClick={() => selectCityFromSearch(city)} className="w-full text-left px-4 py-2 hover:bg-plant-50 transition-colors border-b border-plant-100 last:border-b-0 flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <div>
                          <div className="font-medium text-plant-800">{city.name}</div>
                          <div className="text-sm text-gray-600">{city.region}</div>
                        </div>
                      </button>)}
                  </div>}
                
                {/* Mostrar ubicación seleccionada */}
                {formData.location && !locationSearch}
              </div>
              
              {/* Botón para mostrar/ocultar mapa */}
              
              
              {/* Mapa */}
              {showMap && <LocationMap onLocationSelect={handleLocationSelect} initialLocation={{
              name: formData.location,
              coordinates: formData.coordinates
            }} />}
            </div>
          </CardContent>
        </Card>

        {/* Bio Section */}
        <Card className="border-plant-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-plant-800">
              <FileText size={20} />
              Descripción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-plant-700 font-medium">
                Cuéntanos sobre ti y tus plantas
              </Label>
              <Textarea id="bio" value={formData.bio} onChange={e => handleInputChange('bio', e.target.value)} className="border-plant-200 focus:border-plant-400 min-h-[100px]" placeholder="Describe tu pasión por las plantas, experiencia, tipos favoritos..." />
              <p className="text-xs text-gray-500">
                {formData.bio.length}/500 caracteres
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="pt-4">
          <Button 
            onClick={handleSave} 
            className="w-full bg-plant-500 hover:bg-plant-600 text-white" 
            size="lg"
            disabled={loading}
          >
            <Save size={20} className="mr-2" />
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 m-4 max-w-md w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">Tomar foto</h3>
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover rounded-lg bg-gray-100"
                />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                Cancelar
              </Button>
              <Button onClick={capturePhoto} className="flex-1 bg-plant-500 hover:bg-plant-600">
                <Camera size={16} className="mr-2" />
                Capturar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>;
};
export default EditProfile;