import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Euro, MessageCircle, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Plant {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  images: string[];
  sale_type: string;
  exchange_for: string | null;
  user_id: string;
  created_at: string;
}

const Purchase = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlant();
    }
  }, [id]);

  const fetchPlant = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching plant:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información de la planta",
          variant: "destructive"
        });
        return;
      }

      setPlant(data);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al cargar la planta",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (orderType: 'purchase' | 'exchange') => {
    if (!user || !plant) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para realizar una compra",
        variant: "destructive"
      });
      return;
    }

    if (user.id === plant.user_id) {
      toast({
        title: "No puedes comprar tu propia planta",
        description: "Esta es tu planta, no puedes comprarla",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const orderData = {
        buyer_id: user.id,
        seller_id: plant.user_id,
        plant_id: plant.id,
        order_type: orderType,
        amount: orderType === 'purchase' ? plant.price : null,
        message: message.trim() || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('orders')
        .insert(orderData);

      if (error) {
        console.error('Error creating order:', error);
        toast({
          title: "Error al procesar pedido",
          description: "Hubo un problema al crear tu pedido. Inténtalo de nuevo.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: orderType === 'purchase' ? "¡Pedido realizado!" : "¡Solicitud de intercambio enviada!",
        description: orderType === 'purchase' 
          ? "Tu pedido se ha enviado al vendedor. Te contactarán pronto."
          : "Tu solicitud de intercambio se ha enviado. El propietario la revisará.",
        variant: "default"
      });

      // Navigate to messages or back
      navigate('/messages');
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error inesperado",
        description: "Hubo un problema al procesar tu solicitud",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-plant-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-plant-600 mx-auto"></div>
          <p className="text-plant-600 mt-2">Cargando planta...</p>
        </div>
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-plant-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-plant-800 mb-2">Planta no encontrada</h2>
          <p className="text-plant-600 mb-4">Esta planta no existe o ya no está disponible</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const canPurchase = plant.sale_type.includes('sell') && plant.price;
  const canExchange = plant.sale_type.includes('exchange') && plant.exchange_for;
  const canGift = plant.sale_type.includes('gift');

  return (
    <div className="min-h-screen bg-gradient-to-br from-plant-50 via-emerald-50 to-teal-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-plant-200 px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="text-plant-600 hover:text-plant-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-plant-800">Detalles de la planta</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Plant Images */}
        {plant.images && plant.images.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={plant.images[0]} 
                alt={plant.title}
                className="w-full h-full object-cover"
              />
            </div>
            {plant.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {plant.images.slice(1, 4).map((image, index) => (
                  <div key={index} className="aspect-square rounded-xl overflow-hidden shadow-md">
                    <img 
                      src={image} 
                      alt={`${plant.title} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Plant Info */}
        <Card className="border-plant-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-plant-800 mb-2">{plant.title}</h2>
                <div className="flex items-center gap-1 text-plant-600 mb-3">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{plant.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Heart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <p className="text-plant-700 mb-4 leading-relaxed">{plant.description}</p>

            {/* Price/Exchange Info */}
            <div className="space-y-3 mb-6">
              {canPurchase && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <Euro className="h-5 w-5 text-emerald-600" />
                  <span className="font-semibold text-emerald-800">Precio: €{plant.price}</span>
                </div>
              )}
              
              {canExchange && (
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-blue-800 font-medium">Intercambio por:</span>
                  <p className="text-blue-700 text-sm mt-1">{plant.exchange_for}</p>
                </div>
              )}
              
              {canGift && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-rose-800 font-medium">🎁 Disponible como regalo</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="border-plant-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-plant-800">
              <MessageCircle className="h-5 w-5" />
              Contactar con el propietario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="message" className="text-plant-700 font-medium">
                Mensaje (opcional)
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe un mensaje al propietario..."
                className="mt-2 border-plant-300 focus:border-plant-500 rounded-xl"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              {canPurchase && (
                <Button 
                  onClick={() => handlePurchase('purchase')}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl"
                >
                  {submitting ? 'Procesando...' : `Comprar por €${plant.price}`}
                </Button>
              )}
              
              {canExchange && (
                <Button 
                  onClick={() => handlePurchase('exchange')}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold py-3 rounded-xl"
                >
                  {submitting ? 'Enviando...' : 'Proponer intercambio'}
                </Button>
              )}
              
              {canGift && !canPurchase && !canExchange && (
                <Button 
                  onClick={() => handlePurchase('exchange')}
                  disabled={submitting}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold py-3 rounded-xl"
                >
                  {submitting ? 'Enviando...' : 'Solicitar regalo 🎁'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Purchase;