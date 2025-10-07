import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface Plant {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  exchange_for: string | null;
  location: string;
  sale_type: string;
  images: string[];
  status: string;
  user_id: string;
}

const plantCategories = [
  { value: 'interior', label: '🌿 Plantas de Interior', emoji: '🌿' },
  { value: 'exterior', label: '🌳 Plantas de Exterior', emoji: '🌳' },
  { value: 'suculentas', label: '🌵 Suculentas y Cactus', emoji: '🌵' },
  { value: 'frutales', label: '🍎 Árboles Frutales', emoji: '🍎' },
  { value: 'aromaticas', label: '🌱 Plantas Aromáticas', emoji: '🌱' },
  { value: 'flores', label: '🌸 Plantas con Flores', emoji: '🌸' },
  { value: 'trepadoras', label: '🍃 Plantas Trepadoras', emoji: '🍃' },
  { value: 'otras', label: '🌺 Otras Plantas', emoji: '🌺' }
];

const EditPlant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'interior',
    location: '',
    price: '',
    exchange_for: '',
    sale_type: 'sell'
  });

  useEffect(() => {
    const fetchPlant = async () => {
      if (!id || !user) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('plants')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setPlant(data);
          setFormData({
            title: data.title || '',
            description: data.description || '',
            category: data.category || 'interior',
            location: data.location || '',
            price: data.price?.toString() || '',
            exchange_for: data.exchange_for || '',
            sale_type: data.sale_type || 'sell'
          });
        }
      } catch (error) {
        console.error('Error fetching plant:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la planta",
          variant: "destructive"
        });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [id, user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plant || !user) return;

    setIsSubmitting(true);
    try {
      const updates = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        price: formData.price ? parseFloat(formData.price) : null,
        exchange_for: formData.exchange_for || null,
        sale_type: formData.sale_type,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plant.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "¡Actualizado!",
        description: "Los cambios se han guardado correctamente",
      });

      navigate(`/plant/${plant.id}`);
    } catch (error) {
      console.error('Error updating plant:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la planta",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!plant || !user) return;

    try {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plant.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "¡Eliminado!",
        description: "La planta ha sido eliminada correctamente",
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error deleting plant:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la planta",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Cargando...</div>
      </div>
    );
  }

  if (!plant) {
    return null;
  }

  const selectedCategory = plantCategories.find(cat => cat.value === formData.category);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button
            onClick={() => navigate(`/plant/${plant.id}`)}
            variant="ghost"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Edita el producto</h1>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="pb-32">
        {/* Images Section */}
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {plant.images && plant.images.length > 0 ? (
              plant.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                  onClick={() => setMainImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === mainImageIndex && (
                    <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-foreground">
                      Foto principal
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 aspect-square rounded-lg bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Sin imágenes</span>
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-4 space-y-4">
          {/* Category */}
          <div className="bg-card border border-border rounded-lg p-4">
            <Label className="text-muted-foreground text-sm">Categoría*</Label>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-foreground font-medium">
                  {selectedCategory?.emoji} {selectedCategory?.label.replace(selectedCategory.emoji, '').trim()}
                </p>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="bg-card border border-border rounded-lg p-4">
            <Label htmlFor="title" className="text-muted-foreground text-sm">Título*</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Título del anuncio"
              className="mt-2 border-0 bg-transparent p-0 text-foreground font-medium focus-visible:ring-0"
              maxLength={50}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {formData.title.length}/50
            </div>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-4">
            <Label htmlFor="description" className="text-muted-foreground text-sm">Descripción*</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe tu planta..."
              className="mt-2 min-h-[120px] border-0 bg-transparent p-0 text-foreground resize-none focus-visible:ring-0"
              maxLength={500}
            />
            <div className="text-right text-xs text-muted-foreground mt-1">
              {formData.description.length}/500
            </div>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-lg p-4">
            <Label htmlFor="location" className="text-muted-foreground text-sm">Ubicación*</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Ciudad"
              className="mt-2 border-0 bg-transparent p-0 text-foreground font-medium focus-visible:ring-0"
            />
          </div>

          {/* Price */}
          {(formData.sale_type === 'sell' || formData.sale_type === 'all') && (
            <div className="bg-card border border-border rounded-lg p-4">
              <Label htmlFor="price" className="text-muted-foreground text-sm">Precio</Label>
              <div className="flex items-center mt-2">
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="border-0 bg-transparent p-0 text-foreground font-medium focus-visible:ring-0"
                  min="0"
                  step="0.01"
                />
                <span className="text-foreground font-medium ml-2">€</span>
              </div>
            </div>
          )}

          {/* Exchange For */}
          {(formData.sale_type === 'exchange' || formData.sale_type === 'all') && (
            <div className="bg-card border border-border rounded-lg p-4">
              <Label htmlFor="exchange_for" className="text-muted-foreground text-sm">Busca a cambio</Label>
              <Input
                id="exchange_for"
                name="exchange_for"
                value={formData.exchange_for}
                onChange={handleInputChange}
                placeholder="¿Qué buscas?"
                className="mt-2 border-0 bg-transparent p-0 text-foreground font-medium focus-visible:ring-0"
              />
            </div>
          )}

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar anuncio
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. El anuncio será eliminado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full"
          >
            {isSubmitting ? 'Guardando...' : 'Continuar'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditPlant;
