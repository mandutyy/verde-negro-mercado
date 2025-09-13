import Header from '@/components/Header';
import { Star, MessageSquare, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MyReviews = () => {
  const receivedReviews = [
    {
      id: '1',
      reviewer: 'María García',
      reviewerAvatar: '',
      rating: 5,
      comment: 'Excelente vendedora! La planta llegó en perfectas condiciones y muy bien empaquetada. Súper recomendable.',
      date: '2024-01-15',
      plantTitle: 'Monstera Deliciosa',
      type: 'venta'
    },
    {
      id: '2',
      reviewer: 'Carlos López',
      reviewerAvatar: '',
      rating: 4,
      comment: 'Buen intercambio, comunicación fluida. La planta estaba sana aunque un poco más pequeña de lo esperado.',
      date: '2024-01-10',
      plantTitle: 'Pothos Dorado',
      type: 'intercambio'
    },
    {
      id: '3',
      reviewer: 'Ana Martínez',
      reviewerAvatar: '',
      rating: 5,
      comment: 'Perfecta! Tal como se describía. Gracias por el cuidado en el envío.',
      date: '2024-01-05',
      plantTitle: 'Pilea Peperomioides',
      type: 'venta'
    }
  ];

  const givenReviews = [
    {
      id: '1',
      reviewee: 'Pedro Sánchez',
      revieweeAvatar: '',
      rating: 5,
      comment: 'Vendedor muy profesional, envío rápido y planta en excelente estado.',
      date: '2024-01-12',
      plantTitle: 'Ficus Lyrata',
      type: 'compra'
    },
    {
      id: '2',
      reviewee: 'Laura Ruiz',
      revieweeAvatar: '',
      rating: 4,
      comment: 'Buen intercambio, aunque tardó un poco más de lo esperado.',
      date: '2024-01-08',
      plantTitle: 'Sansevieria',
      type: 'intercambio'
    }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        size={16}
        className={`${
          index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'venta':
      case 'compra':
        return 'bg-primary text-primary-foreground';
      case 'intercambio':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const ReviewCard = ({ review, isReceived = true }: { review: any, isReceived?: boolean }) => (
    <Card className="border-plant-200 shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={isReceived ? review.reviewerAvatar : review.revieweeAvatar} />
            <AvatarFallback className="bg-plant-100 text-plant-700">
              {isReceived 
                ? review.reviewer.split(' ').map((n: string) => n[0]).join('')
                : review.reviewee.split(' ').map((n: string) => n[0]).join('')
              }
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-medium text-gray-900">
                  {isReceived ? review.reviewer : review.reviewee}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {renderStars(review.rating)}
                  </div>
                  <Badge className={getTypeColor(review.type)}>
                    {review.type.charAt(0).toUpperCase() + review.type.slice(1)}
                  </Badge>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(review.date)}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 mb-2">
              {review.comment}
            </p>
            
            <div className="text-xs text-gray-500">
              Planta: <span className="font-medium">{review.plantTitle}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const calculateAverageRating = (reviews: any[]) => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Mis Valoraciones" showBackButton />
      
      <div className="px-4 py-4">
        {/* Rating Summary */}
        <Card className="border-plant-200 shadow-sm mb-6">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                <span className="text-2xl font-bold text-gray-900">
                  {calculateAverageRating(receivedReviews)}
                </span>
              </div>
              <p className="text-gray-600 text-sm">
                Basado en {receivedReviews.length} valoraciones recibidas
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Tabs */}
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Recibidas ({receivedReviews.length})
            </TabsTrigger>
            <TabsTrigger value="given" className="flex items-center gap-2">
              <User size={16} />
              Dadas ({givenReviews.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="mt-6">
            {receivedReviews.length > 0 ? (
              <div>
                {receivedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} isReceived={true} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes valoraciones recibidas
                </h3>
                <p className="text-gray-600">
                  Las valoraciones aparecerán aquí después de tus primeras transacciones
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="given" className="mt-6">
            {givenReviews.length > 0 ? (
              <div>
                {givenReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} isReceived={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No has dado valoraciones
                </h3>
                <p className="text-gray-600">
                  Después de comprar o intercambiar plantas, podrás valorar a otros usuarios
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyReviews;