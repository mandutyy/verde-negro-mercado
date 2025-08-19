import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Eye, Clock, Star, MessageCircle, Share, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const PlantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);

  // Mock data - en una app real vendría de una API o base de datos
  const mockPlant = {
    id: '1',
    title: 'Monstera Deliciosa - Planta adulta 2 años',
    price: '€45',
    location: 'Madrid Centro',
    images: [
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&h=400&fit=crop'
    ],
    category: 'interior',
    condition: 'excellent',
    seller: {
      name: 'PlantLover23',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
      rating: 4.8,
      reviewCount: 127,
      joinDate: 'Miembro desde 2023',
      responseTime: 'Responde en menos de 2 horas'
    },
    rating: 4.8,
    type: 'sell' as const,
    description: 'Monstera deliciosa adulta de 2 años, muy sana y con muchas hojas fenestradas. Incluye maceta de cerámica blanca. La planta está perfecta para cualquier hogar y es muy fácil de cuidar. Ha estado en mi salón con luz indirecta y se ha desarrollado fantásticamente.',
    timeAgo: 'hace 2h',
    views: 127,
    distance: '0.5 km',
    isPromoted: true,
    tags: ['Entrega a domicilio', 'Negociable', 'Incluye maceta', 'Saludable']
  };

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleContact = () => {
    // Navegar al chat con este vendedor
    navigate(`/chat/seller-${mockPlant.seller.name}`);
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
              src={mockPlant.images[currentImageIndex]}
              alt={mockPlant.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Image indicators */}
          {mockPlant.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-2">
                {mockPlant.images.map((_, index) => (
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
            {mockPlant.isPromoted && (
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
              {mockPlant.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-plant-600">
                {mockPlant.price}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {mockPlant.views}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {mockPlant.timeAgo}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{mockPlant.location} • {mockPlant.distance}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {mockPlant.tags.map((tag, index) => (
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
                  <div className="font-medium">{categoryLabels[mockPlant.category as keyof typeof categoryLabels]}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Estado</div>
                  <div className="font-medium">{conditionLabels[mockPlant.condition as keyof typeof conditionLabels]}</div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="text-sm text-muted-foreground mb-2">Descripción</div>
                <p className="text-foreground leading-relaxed">
                  {mockPlant.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mockPlant.seller.avatar} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {mockPlant.seller.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{mockPlant.seller.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({mockPlant.seller.reviewCount} valoraciones)
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>{mockPlant.seller.joinDate}</div>
                    <div>{mockPlant.seller.responseTime}</div>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/profile/${mockPlant.seller.name}`)}
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
            Contactar con {mockPlant.seller.name}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlantDetail;