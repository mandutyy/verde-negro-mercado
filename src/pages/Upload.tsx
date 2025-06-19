
import { useState } from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const Upload = () => {
  const [isExchange, setIsExchange] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulate image upload
      const newImages = Array.from(files).map(() => 
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=300&h=300&fit=crop'
      );
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-plant-subtle pb-20">
      <Header title="Subir Planta" />
      
      <div className="px-4 py-4">
        <Card className="border-plant-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-plant-800">Añade tu planta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label htmlFor="images" className="text-plant-700 font-medium">
                Fotos (máximo 5)
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
                      <img
                        key={index}
                        src={img}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-plant-700 font-medium">
                Título
              </Label>
              <Input
                id="title"
                placeholder="Ej: Monstera Deliciosa grande"
                className="mt-2 border-plant-300 focus:border-plant-500"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-plant-700 font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                placeholder="Describe tu planta, su estado, cuidados..."
                className="mt-2 border-plant-300 focus:border-plant-500 min-h-[100px]"
              />
            </div>

            {/* Category */}
            <div>
              <Label className="text-plant-700 font-medium">Categoría</Label>
              <Select>
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
            </div>

            {/* Exchange Toggle */}
            <div className="flex items-center justify-between p-4 bg-plant-50 rounded-lg">
              <div>
                <Label className="text-plant-700 font-medium">
                  ¿Intercambio?
                </Label>
                <p className="text-sm text-plant-600 mt-1">
                  Intercambia tu planta en lugar de venderla
                </p>
              </div>
              <Switch
                checked={isExchange}
                onCheckedChange={setIsExchange}
              />
            </div>

            {/* Price or Exchange */}
            {!isExchange ? (
              <div>
                <Label htmlFor="price" className="text-plant-700 font-medium">
                  Precio (€)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  className="mt-2 border-plant-300 focus:border-plant-500"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="exchange" className="text-plant-700 font-medium">
                  ¿Qué buscas a cambio?
                </Label>
                <Textarea
                  id="exchange"
                  placeholder="Describe qué tipo de plantas te interesan..."
                  className="mt-2 border-plant-300 focus:border-plant-500"
                />
              </div>
            )}

            {/* Location */}
            <div>
              <Label htmlFor="location" className="text-plant-700 font-medium">
                Ubicación
              </Label>
              <Input
                id="location"
                placeholder="Ciudad"
                className="mt-2 border-plant-300 focus:border-plant-500"
              />
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full bg-plant-500 hover:bg-plant-600 text-white font-medium py-3"
              size="lg"
            >
              Publicar Planta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Upload;
