import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Camera, MapPin, User, FileText, Save, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: 'Juan Díaz',
    location: 'Madrid, España',
    bio: '🌱 Amante de las plantas desde siempre. Me encanta intercambiar y ayudar a otros con sus jardines urbanos.',
    avatar: ''
  });

  const handleSave = () => {
    // Here you would typically save to a backend
    toast({
      title: "Perfil actualizado",
      description: "Los cambios se han guardado correctamente.",
    });
    navigate('/profile');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <div className="flex items-center justify-between p-4 bg-white border-b border-plant-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/profile')}
          className="text-plant-700"
        >
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
              <Button variant="outline" className="border-plant-300 text-plant-600">
                <Camera size={16} className="mr-2" />
                Cambiar foto
              </Button>
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
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="border-plant-200 focus:border-plant-400"
                placeholder="Tu nombre completo"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location" className="text-plant-700 font-medium flex items-center gap-2">
                <MapPin size={16} />
                Ubicación
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="border-plant-200 focus:border-plant-400"
                placeholder="Ciudad, País"
              />
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
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className="border-plant-200 focus:border-plant-400 min-h-[100px]"
                placeholder="Describe tu pasión por las plantas, experiencia, tipos favoritos..."
              />
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
          >
            <Save size={20} className="mr-2" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;