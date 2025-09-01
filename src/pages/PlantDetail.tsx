import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Eye, Clock, Star, MessageCircle, Share, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockPlants } from '@/data/mockPlants';
import { supabase } from '@/integrations/supabase/client';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // Buscar la planta por ID
  const plant = mockPlants.find(p => p.id === id);
  
  if (!plant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Planta no encontrada</h1>
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleContact = async () => {
    // Crear una conversación con el vendedor
    const sellerId = plant.seller.id;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Buscar conversación existente
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${sellerId}),and(participant_1.eq.${sellerId},participant_2.eq.${user.id})`)
        .maybeSingle();
      
      if (existingConversation) {
        navigate(`/chat/${existingConversation.id}`);
      } else {
        // Crear nueva conversación
        const { data: newConversation } = await supabase
          .from('conversations')
          .insert([{
            participant_1: user.id,
            participant_2: sellerId
          }])
          .select()
          .single();
        
        if (newConversation) {
          navigate(`/chat/${newConversation.id}`);
        }
      }
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const conditionLabels = {
    excellent: 'Excelente',
    good: 'Bueno',
    fair: 'Regular'
  };

  const categoryLabels = {
    interior: 'Planta de interior',
    exterior: 'Planta de exterior', 
    suculentas: 'Suculenta',
    frutales: 'Planta frutal'
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFavorite}
            >
              <Heart 
                className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
              />
            </Button>
            <Button variant="ghost" size="icon">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pb-20">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-[4/3] overflow-hidden">
            <img 
              src={plant.images[currentImageIndex]}
              alt={plant.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image indicators */}
          {plant.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-2">
                {plant.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {plant.isPromoted && (
              <Badge className="bg-plant-500 text-white">
                Destacado
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {plant.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-plant-600">
                {plant.priceDisplay}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {plant.views}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {plant.timeAgo}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{plant.location} • {plant.distance}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {plant.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Plant Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles de la planta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Categoría</div>
                  <div className="font-medium">{categoryLabels[plant.category as keyof typeof categoryLabels]}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estado</div>
                  <div className="font-medium">{conditionLabels[plant.condition as keyof typeof conditionLabels]}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Descripción</div>
                <p className="text-foreground leading-relaxed">
                  {plant.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={plant.seller.avatar} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {plant.seller.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{plant.seller.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({plant.seller.reviewCount} valoraciones)
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{plant.seller.joinDate}</div>
                    <div>{plant.seller.responseTime}</div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/profile/${plant.seller.name}`)}
                >
                  Ver perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Contact Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-4xl mx-auto">
          <Button 
            onClick={handleContact}
            className="w-full bg-plant-500 hover:bg-plant-600"
            size="lg"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Contactar con {plant.seller.name}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;