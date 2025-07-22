
import { useState } from 'react';
import { Upload as UploadIcon, X, Gift, DollarSign, ArrowLeftRight, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';

const Upload = () => {
  const [selectedOption, setSelectedOption] = useState<'sell' | 'exchange' | 'gift' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saleType, setSaleType] = useState<'sell' | 'exchange' | 'gift' | 'sell-exchange' | 'sell-gift' | 'exchange-gift' | 'all'>('sell');
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

  const saleOptions = [
    { value: 'sell', label: 'Solo venta', icon: DollarSign, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'exchange', label: 'Solo intercambio', icon: ArrowLeftRight, color: 'bg-teal-100 text-teal-700 border-teal-200' },
    { value: 'gift', label: 'Solo regalo', icon: Gift, color: 'bg-rose-100 text-rose-700 border-rose-200' },
    { value: 'sell-exchange', label: 'Venta e intercambio', icon: DollarSign, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'sell-gift', label: 'Venta o regalo', icon: Sparkles, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'exchange-gift', label: 'Intercambio o regalo', icon: ArrowLeftRight, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { value: 'all', label: 'Todas las opciones', icon: Sparkles, color: 'bg-gradient-to-r from-plant-100 to-emerald-100 text-plant-800 border-plant-300' }
  ];

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
    
    // Validation for price field
    if (['sell', 'sell-exchange', 'sell-gift', 'all'].includes(saleType) && !formData.price.trim()) {
      newErrors.price = 'El precio es obligatorio para venta';
    }
    
    // Validation for exchange field
    if (['exchange', 'sell-exchange', 'exchange-gift', 'all'].includes(saleType) && !formData.exchangeFor.trim()) {
      newErrors.exchangeFor = 'Describe qué buscas a cambio';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const currentOption = saleOptions.find(opt => opt.value === saleType);
      toast({
        title: "¡Planta publicada! 🌱",
        description: `Tu planta se ha publicado como: ${currentOption?.label}`,
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

  const showPriceField = ['sell', 'sell-exchange', 'sell-gift', 'all'].includes(saleType);
  const showExchangeField = ['exchange', 'sell-exchange', 'exchange-gift', 'all'].includes(saleType);
  const showGiftMessage = ['gift', 'sell-gift', 'exchange-gift', 'all'].includes(saleType);

  const handleOptionSelect = (option: 'sell' | 'exchange' | 'gift') => {
    setSelectedOption(option);
    setSaleType(option);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-plant-50 via-emerald-50 to-teal-50 pb-20">
      <Header title="🌱 Subir contenido" />
      
      <div className="px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Título principal */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-plant-800 mb-2">¿Qué quieres hacer?</h1>
            <p className="text-plant-600">Elige cómo quieres compartir tu planta</p>
          </div>

          {/* Diseño del árbol con ramas */}
          <div className="relative mb-8">
            {/* Contenedor de las opciones con ramas */}
            <div className="relative">
              {/* Tronco principal vertical */}
              <div className="absolute left-1/2 top-16 w-1 h-24 bg-gradient-to-b from-amber-700 to-amber-800 transform -translate-x-1/2 z-10"></div>
              
              {/* Ramas diagonales */}
              <div className="absolute left-1/2 top-20 transform -translate-x-1/2 z-10">
                {/* Rama izquierda - Vender */}
                <div className="absolute w-16 h-0.5 bg-amber-700 transform -rotate-45 -translate-x-16 translate-y-4"></div>
                {/* Rama derecha - Regalar */}
                <div className="absolute w-16 h-0.5 bg-amber-700 transform rotate-45 translate-x-0 translate-y-4"></div>
                {/* Rama central - Intercambiar */}
                <div className="absolute w-12 h-0.5 bg-amber-700 transform -translate-x-6 translate-y-8"></div>
              </div>

              {/* Las tres opciones principales */}
              <div className="flex justify-between items-start relative z-20">
                {/* Opción Vender */}
                <button
                  onClick={() => handleOptionSelect('sell')}
                  className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 group w-24 ${selectedOption === 'sell' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-plant-200 hover:border-plant-400'}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <DollarSign className="h-8 w-8 text-amber-700" />
                  </div>
                  <span className="text-plant-800 font-semibold text-sm">Vender</span>
                </button>

                {/* Opción Intercambiar (centro) */}
                <button
                  onClick={() => handleOptionSelect('exchange')}
                  className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 group w-24 ${selectedOption === 'exchange' ? 'border-plant-400 ring-2 ring-plant-200' : 'border-plant-200 hover:border-plant-400'}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-plant-200 to-emerald-300 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ArrowLeftRight className="h-8 w-8 text-plant-700" />
                  </div>
                  <span className="text-plant-800 font-semibold text-sm">Intercambiar</span>
                </button>

                {/* Opción Regalar */}
                <button
                  onClick={() => handleOptionSelect('gift')}
                  className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 group w-24 ${selectedOption === 'gift' ? 'border-rose-400 ring-2 ring-rose-200' : 'border-plant-200 hover:border-plant-400'}`}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-200 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Gift className="h-8 w-8 text-rose-700" />
                  </div>
                  <span className="text-plant-800 font-semibold text-sm">Regalar</span>
                </button>
              </div>

              {/* Raíces decorativas */}
              <div className="flex justify-center mt-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full border-4 border-amber-700 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-amber-700" />
                  </div>
                  {/* Raíces que se extienden */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-32 h-0.5 bg-amber-600 absolute transform -rotate-12 -translate-x-16"></div>
                    <div className="w-32 h-0.5 bg-amber-600 absolute transform rotate-12 -translate-x-16"></div>
                    <div className="w-24 h-0.5 bg-amber-600 absolute transform -translate-x-12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje motivacional */}
          <div className="text-center p-4 bg-white/70 rounded-xl border border-plant-200 mb-6">
            <p className="text-plant-700 text-sm">
              🌱 Cada planta compartida hace crecer nuestra comunidad verde
            </p>
          </div>

          {/* Botón para mostrar/ocultar formulario */}
          {selectedOption && (
            <div className="text-center">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-gradient-to-r from-plant-500 to-emerald-600 hover:from-plant-600 hover:to-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {showForm ? 'Ocultar formulario' : 'Continuar con el formulario'}
              </button>
            </div>
          )}
        </div>

        {/* Formulario desplegable */}
        {selectedOption && showForm && (
          <div className="mt-8 animate-fade-in">
            <form onSubmit={handleSubmit}>
          <Card className="border-plant-200 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-plant-500 to-emerald-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-white">
                <Sparkles className="h-6 w-6" />
                Añade tu planta al jardín comunitario
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Image Upload with Plant Theme */}
              <div>
                <Label htmlFor="images" className="text-plant-800 font-semibold text-lg flex items-center gap-2">
                  📸 Fotos de tu planta (máximo 5) *
                </Label>
                <div className="mt-3">
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
                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-plant-300 border-dashed rounded-2xl cursor-pointer bg-gradient-to-br from-plant-50 to-emerald-100 hover:from-plant-100 hover:to-emerald-200 transition-all duration-300 shadow-inner"
                  >
                    <div className="text-center">
                      <UploadIcon className="text-plant-600 mb-3 mx-auto" size={40} />
                      <span className="text-plant-700 font-medium text-lg">
                        🌿 Toca para subir fotos
                      </span>
                      <p className="text-plant-600 text-sm mt-1">
                        Muestra la belleza de tu planta
                      </p>
                    </div>
                  </label>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={img}
                            alt={`Uploaded ${index + 1}`}
                            className="w-full h-24 object-cover rounded-xl shadow-md group-hover:shadow-lg transition-shadow"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.images && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">⚠️ {errors.images}</p>}
                </div>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title" className="text-plant-800 font-semibold text-lg">
                  🏷️ Nombre de tu planta *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ej: Monstera Deliciosa majestuosa 🌿"
                  className="mt-2 border-plant-300 focus:border-plant-500 rounded-xl text-lg p-4 bg-white/50"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">⚠️ {errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-plant-800 font-semibold text-lg">
                  📝 Cuenta la historia de tu planta *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe tu planta: edad, tamaño, cuidados especiales, por qué es especial para ti... 🌱"
                  className="mt-2 border-plant-300 focus:border-plant-500 min-h-[120px] rounded-xl text-base p-4 bg-white/50"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">⚠️ {errors.description}</p>}
              </div>

              {/* Category with Emojis */}
              <div>
                <Label className="text-plant-800 font-semibold text-lg">🌿 Tipo de planta *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-2 border-plant-300 focus:border-plant-500 rounded-xl text-base p-4 bg-white/50">
                    <SelectValue placeholder="Selecciona el tipo de planta" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-plant-200 rounded-xl">
                    {plantCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value} className="hover:bg-plant-50 rounded-lg">
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">⚠️ {errors.category}</p>}
              </div>

              {/* Sale Type Selection - Enhanced Design */}
              <div className="p-6 bg-gradient-to-r from-plant-50 to-emerald-50 rounded-2xl border border-plant-200">
                <Label className="text-plant-800 font-semibold text-lg mb-4 block flex items-center gap-2">
                  💚 ¿Cómo quieres compartir tu planta? *
                </Label>
                <RadioGroup value={saleType} onValueChange={(value: typeof saleType) => setSaleType(value)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {saleOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={option.value} id={option.value} className="text-plant-600" />
                        <Label 
                          htmlFor={option.value} 
                          className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${option.color} ${saleType === option.value ? 'ring-2 ring-plant-400 shadow-md' : ''}`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{option.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* Gift Message */}
              {showGiftMessage && (
                <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-100 rounded-xl border border-rose-200">
                  <p className="text-rose-700 font-medium flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    ¡Qué generoso! Regalar plantas es una forma hermosa de compartir amor por la naturaleza 🌱💕
                  </p>
                </div>
              )}

              {/* Price Field */}
              {showPriceField && (
                <div>
                  <Label htmlFor="price" className="text-plant-800 font-semibold text-lg flex items-center gap-2">
                    💰 Precio de venta (€) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="Ej: 15"
                    className="mt-2 border-plant-300 focus:border-plant-500 rounded-xl text-lg p-4 bg-white/50"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">⚠️ {errors.price}</p>}
                </div>
              )}

              {/* Exchange Field */}
              {showExchangeField && (
                <div>
                  <Label htmlFor="exchange" className="text-plant-800 font-semibold text-lg flex items-center gap-2">
                    🔄 ¿Qué plantas te gustaría recibir? *
                  </Label>
                  <Textarea
                    id="exchange"
                    value={formData.exchangeFor}
                    onChange={(e) => handleInputChange('exchangeFor', e.target.value)}
                    placeholder="Ej: Me encantaría un pino pequeño, suculentas variadas, o plantas aromáticas... 🌿"
                    className="mt-2 border-plant-300 focus:border-plant-500 rounded-xl text-base p-4 bg-white/50"
                  />
                  <div className="mt-3">
                    <p className="text-sm text-plant-700 mb-3 font-medium">🌟 Sugerencias populares:</p>
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
                          className="px-4 py-2 bg-plant-100 text-plant-800 rounded-full text-sm hover:bg-plant-200 transition-colors border border-plant-300 shadow-sm hover:shadow-md"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                  {errors.exchangeFor && <p className="text-red-500 text-sm mt-1">⚠️ {errors.exchangeFor}</p>}
                </div>
              )}

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-plant-800 font-semibold text-lg flex items-center gap-2">
                  📍 ¿Dónde te encuentras? *
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ciudad o zona"
                  className="mt-2 border-plant-300 focus:border-plant-500 rounded-xl text-lg p-4 bg-white/50"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">⚠️ {errors.location}</p>}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-gradient-to-r from-plant-500 to-emerald-600 hover:from-plant-600 hover:to-emerald-700 text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                🌱 Publicar mi Planta
              </Button>
            </CardContent>
            </Card>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
