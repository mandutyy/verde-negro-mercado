
import { useState } from 'react';
import { Upload as UploadIcon, X } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const [saleType, setSaleType] = useState<'sell' | 'exchange' | 'both'>('sell');
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    exchangeFor: '',
    location: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const exchangeSuggestions = [
    'Pino', 'Monstera', 'Ficus', 'Suculentas variadas', 'Plantas aromáticas',
    'Cactus', 'Pothos', 'Sansevieria', 'Plantas de interior', 'Plantas de exterior'
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (images.length + files.length > 5) {
        toast({
          title: "Máximo 5 fotos",
          description: "Solo puedes subir un máximo de 5 fotos por planta",
          variant: "destructive"
        });
        return;
      }
      
      const newImages = Array.from(files).map((file, index) => 
        `https://images.unsplash.com/photo-${518495973542 + index}?w=300&h=300&fit=crop`
      );
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.category) newErrors.category = 'Selecciona una categoría';
    if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria';
    if (images.length === 0) newErrors.images = 'Sube al menos una foto';
    
    if (saleType === 'sell' && !formData.price.trim()) {
      newErrors.price = 'El precio es obligatorio para venta';
    }
    
    if ((saleType === 'exchange' || saleType === 'both') && !formData.exchangeFor.trim()) {
      newErrors.exchangeFor = 'Describe qué buscas a cambio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      toast({
        title: "¡Planta publicada!",
        description: "Tu planta se ha publicado correctamente y ya está visible para otros usuarios.",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        exchangeFor: '',
        location: ''
      });
      setImages([]);
      setSaleType('sell');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Subir Planta" />
      
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit}>
          <Card className="border-plant-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-plant-800">Añade tu planta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div>
                <Label htmlFor="images" className="text-plant-700 font-medium">
                  Fotos (máximo 5) *
                </Label>
                <div className="mt-2">
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-plant-300 border-dashed rounded-lg cursor-pointer bg-plant-50 hover:bg-plant-100 transition-colors"
                  >
                    <UploadIcon className="text-plant-500 mb-2" size={32} />
                    <span className="text-plant-600 font-medium">
                      Toca para subir fotos
                    </span>
                  </label>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={img}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.images && <p className="text-red-500 text-sm mt-1">{errors.images}</p>}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-plant-700 font-medium">
                  Título *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Monstera Deliciosa grande"
                  className="mt-2 border-plant-300 focus:border-plant-500"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-plant-700 font-medium">
                  Descripción *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu planta, su estado, cuidados..."
                  className="mt-2 border-plant-300 focus:border-plant-500 min-h-[100px]"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <Label className="text-plant-700 font-medium">Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-2 border-plant-300 focus:border-plant-500">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interior">Interior</SelectItem>
                    <SelectItem value="exterior">Exterior</SelectItem>
                    <SelectItem value="suculentas">Suculentas</SelectItem>
                    <SelectItem value="frutales">Frutales</SelectItem>
                    <SelectItem value="aromaticas">Aromáticas</SelectItem>
                    <SelectItem value="otras">Otras</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              {/* Sale Type Selection */}
              <div className="p-4 bg-plant-50 rounded-lg">
                <Label className="text-plant-700 font-medium mb-3 block">
                  ¿Cómo quieres ofrecer tu planta? *
                </Label>
                <RadioGroup value={saleType} onValueChange={(value: 'sell' | 'exchange' | 'both') => setSaleType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sell" id="sell" />
                    <Label htmlFor="sell">Solo venta</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exchange" id="exchange" />
                    <Label htmlFor="exchange">Solo intercambio</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both">Venta e intercambio</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Price Field */}
              {(saleType === 'sell' || saleType === 'both') && (
                <div>
                  <Label htmlFor="price" className="text-plant-700 font-medium">
                    Precio (€) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="10"
                    className="mt-2 border-plant-300 focus:border-plant-500"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>
              )}

              {/* Exchange Field */}
              {(saleType === 'exchange' || saleType === 'both') && (
                <div>
                  <Label htmlFor="exchange" className="text-plant-700 font-medium">
                    ¿Qué buscas a cambio? *
                  </Label>
                  <Textarea
                    id="exchange"
                    value={formData.exchangeFor}
                    onChange={(e) => handleInputChange('exchangeFor', e.target.value)}
                    placeholder="Ej: Un pino, suculentas variadas, plantas aromáticas..."
                    className="mt-2 border-plant-300 focus:border-plant-500"
                  />
                  <div className="mt-2">
                    <p className="text-sm text-plant-600 mb-2">Sugerencias populares:</p>
                    <div className="flex flex-wrap gap-2">
                      {exchangeSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            const current = formData.exchangeFor;
                            const newValue = current ? `${current}, ${suggestion}` : suggestion;
                            handleInputChange('exchangeFor', newValue);
                          }}
                          className="px-3 py-1 bg-plant-100 text-plant-700 rounded-full text-sm hover:bg-plant-200 transition-colors"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.exchangeFor && <p className="text-red-500 text-sm mt-1">{errors.exchangeFor}</p>}
                </div>
              )}

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-plant-700 font-medium">
                  Ubicación *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ciudad"
                  className="mt-2 border-plant-300 focus:border-plant-500"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-plant-500 hover:bg-plant-600 text-white font-medium py-3"
                size="lg"
              >
                Publicar Planta
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default Upload;
