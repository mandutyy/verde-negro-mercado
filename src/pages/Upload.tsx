import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
const Upload = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<'sell' | 'exchange' | 'gift' | null>(null);
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
  const {
    toast
  } = useToast();
  const saleOptions = [
    { value: 'sell', label: 'Venta' },
    { value: 'exchange', label: 'Intercambio' },
    { value: 'gift', label: 'Regalo' },
    { value: 'all', label: 'Todas las opciones' }
  ];
  const plantCategories = [{
    value: 'interior',
    label: '🌿 Plantas de Interior',
    emoji: '🌿'
  }, {
    value: 'exterior',
    label: '🌳 Plantas de Exterior',
    emoji: '🌳'
  }, {
    value: 'suculentas',
    label: '🌵 Suculentas y Cactus',
    emoji: '🌵'
  }, {
    value: 'frutales',
    label: '🍎 Árboles Frutales',
    emoji: '🍎'
  }, {
    value: 'aromaticas',
    label: '🌱 Plantas Aromáticas',
    emoji: '🌱'
  }, {
    value: 'flores',
    label: '🌸 Plantas con Flores',
    emoji: '🌸'
  }, {
    value: 'trepadoras',
    label: '🍃 Plantas Trepadoras',
    emoji: '🍃'
  }, {
    value: 'otras',
    label: '🌺 Otras Plantas',
    emoji: '🌺'
  }];
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
      
      // Crear URLs de las imágenes seleccionadas para mostrarlas
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImages(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
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
    if (!formData.price.trim()) {
      newErrors.price = 'El precio es obligatorio';
    }

    // Validation for exchange field
    if (['exchange', 'sell-exchange', 'exchange-gift', 'all'].includes(saleType) && !formData.exchangeFor.trim()) {
      newErrors.exchangeFor = 'Describe qué buscas a cambio';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error de autenticación",
            description: "Debes iniciar sesión para publicar una planta",
            variant: "destructive"
          });
          return;
        }

        // Prepare plant data
        const plantData = {
          user_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          location: formData.location.trim(),
          sale_type: saleType,
          images: images,
          price: ['sell', 'sell-exchange', 'sell-gift', 'all'].includes(saleType) 
            ? parseFloat(formData.price) || null 
            : null,
          exchange_for: ['exchange', 'sell-exchange', 'exchange-gift', 'all'].includes(saleType) 
            ? formData.exchangeFor.trim() || null 
            : null
        };

        const { error } = await supabase
          .from('plants')
          .insert(plantData);

        if (error) {
          console.error('Error saving plant:', error);
          toast({
            title: "Error al publicar",
            description: "Hubo un problema al guardar tu planta. Inténtalo de nuevo.",
            variant: "destructive"
          });
          return;
        }

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
        setSelectedOption(null);
        
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error inesperado",
          description: "Hubo un problema al publicar tu planta",
          variant: "destructive"
        });
      }
    }
  };
  const showPriceField = ['sell', 'all'].includes(saleType);
  const showExchangeField = ['exchange', 'all'].includes(saleType);

  return (
    <div className="flex h-screen flex-col bg-[#122118] text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <button 
          onClick={() => navigate(-1)}
          className="text-white"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>
        <h1 className="text-xl font-bold">Publicar Anuncio</h1>
        <div className="w-8"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Section - Now at the top */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-white">Añadir Fotos</h2>
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#366348] bg-[#1b3124] p-6 text-center">
              <span className="material-symbols-outlined text-5xl text-[#38e07b]">add_photo_alternate</span>
              <p className="mt-2 font-semibold">Arrastra y suelta tus fotos aquí</p>
              <p className="text-sm text-gray-400">o</p>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
                id="photo-upload" 
              />
              <label 
                htmlFor="photo-upload"
                className="mt-2 rounded-full bg-[#38e07b] px-6 py-2 text-sm font-bold text-[#122118] hover:bg-opacity-90 cursor-pointer"
              >
                Seleccionar archivos
              </label>
              <p className="mt-2 text-xs text-gray-500">Muestra tu planta desde diferentes ángulos.</p>
            </div>
            
            {/* Display uploaded images */}
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img} 
                      alt={`Uploaded ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-xl" 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)} 
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.images && <p className="text-red-400 text-sm mt-2">{errors.images}</p>}
          </div>

          <div className="space-y-4">
            {/* Transaction Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="transaction-type">
                Tipo de transacción
              </label>
              <select 
                className="form-select w-full rounded-xl border-0 bg-[#264532] py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                id="transaction-type"
                value={saleType}
                onChange={(e) => setSaleType(e.target.value as any)}
              >
                {saleOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Plant Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="plant-name">
                Nombre de la planta
              </label>
              <input 
                className="form-input w-full rounded-xl border-0 bg-[#264532] py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                id="plant-name" 
                placeholder="Ej: Monstera Deliciosa" 
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="description">
                Descripción
              </label>
              <textarea 
                className="form-textarea min-h-[100px] w-full rounded-xl border-0 bg-[#264532] py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                id="description" 
                placeholder="Añade detalles sobre tu planta, su estado, cuidados, etc."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="category">
                Categoría
              </label>
              <select 
                className="form-select w-full rounded-xl border-0 bg-[#264532] py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Selecciona una categoría</option>
                {plantCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="location">
                Ubicación
              </label>
              <input 
                className="form-input w-full rounded-xl border-0 bg-[#264532] py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                id="location" 
                placeholder="Ej: Madrid, Centro" 
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
              {errors.location && <p className="text-red-400 text-sm mt-1">{errors.location}</p>}
            </div>

            {/* Submit button right after Location */}
            <div className="mt-6 mb-20">
              <button 
                type="submit"
                className="w-full rounded-full bg-[#38e07b] py-4 text-center font-bold text-[#122118] hover:bg-[#32c970] transition-colors shadow-lg"
              >
                Publicar
              </button>
            </div>

            {/* Price - Always required */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="price">
                Precio
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">€</span>
                <input 
                  className="form-input w-full rounded-xl border-0 bg-[#264532] py-3 pl-8 pr-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                  id="price" 
                  placeholder="0.00" 
                  type="text"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                />
              </div>
              {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price}</p>}
            </div>

            {/* Exchange For - Only for exchange and all */}
            {showExchangeField && (
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300" htmlFor="exchange-for">
                  ¿Qué buscas a cambio?
                </label>
                <input 
                  className="form-input w-full rounded-xl border-0 bg-[#264532] py-3 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#38e07b]" 
                  id="exchange-for" 
                  placeholder="Ej: Pothos, Suculentas" 
                  type="text"
                  value={formData.exchangeFor}
                  onChange={(e) => handleInputChange('exchangeFor', e.target.value)}
                />
                {errors.exchangeFor && <p className="text-red-400 text-sm mt-1">{errors.exchangeFor}</p>}
              </div>
            )}


          </div>
        </form>
      </main>

    </div>
  );
};

export default Upload;