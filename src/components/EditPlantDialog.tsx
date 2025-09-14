import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2, Edit } from 'lucide-react';
import { Plant } from '@/hooks/useUserPlants';

interface EditPlantDialogProps {
  plant: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (plantId: string, updates: Partial<Plant>) => Promise<boolean>;
  onDelete: (plantId: string) => Promise<boolean>;
}

const EditPlantDialog: React.FC<EditPlantDialogProps> = ({ 
  plant, 
  isOpen, 
  onClose, 
  onUpdate, 
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    title: plant?.title || '',
    description: plant?.description || '',
    price: plant?.price?.toString() || '',
    location: plant?.location || '',
    sale_type: plant?.sale_type || 'sell',
    exchange_for: plant?.exchange_for || '',
    status: plant?.status || 'active'
  });

  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (plant) {
      setFormData({
        title: plant.title,
        description: plant.description,
        price: plant.price?.toString() || '',
        location: plant.location,
        sale_type: plant.sale_type,
        exchange_for: plant.exchange_for || '',
        status: plant.status
      });
    }
  }, [plant]);

  const handleSave = async () => {
    if (!plant) return;
    
    setLoading(true);
    const updates = {
      title: formData.title,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : null,
      location: formData.location,
      sale_type: formData.sale_type,
      exchange_for: formData.exchange_for || null,
      status: formData.status
    };

    const success = await onUpdate(plant.id, updates);
    if (success) {
      onClose();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!plant) return;
    
    setLoading(true);
    const success = await onDelete(plant.id);
    if (success) {
      onClose();
    }
    setLoading(false);
  };

  const saleOptions = [
    { value: 'sell', label: 'Venta' },
    { value: 'exchange', label: 'Intercambio' },
    { value: 'gift', label: 'Regalo' },
    { value: 'all', label: 'Todas las opciones' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Activo' },
    { value: 'sold', label: 'Vendido' },
    { value: 'inactive', label: 'Inactivo' }
  ];

  if (!plant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1b3124] border-[#366348] text-white max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Anuncio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-gray-300">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-[#264532] border-[#366348] text-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-[#264532] border-[#366348] text-white min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="price" className="text-gray-300">Precio (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="bg-[#264532] border-[#366348] text-white"
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-gray-300">Ubicación</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="bg-[#264532] border-[#366348] text-white"
            />
          </div>

          <div>
            <Label htmlFor="sale_type" className="text-gray-300">Tipo de transacción</Label>
            <Select value={formData.sale_type} onValueChange={(value) => setFormData(prev => ({ ...prev, sale_type: value }))}>
              <SelectTrigger className="bg-[#264532] border-[#366348] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#264532] border-[#366348] text-white">
                {saleOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#366348]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(formData.sale_type === 'exchange' || formData.sale_type === 'all') && (
            <div>
              <Label htmlFor="exchange_for" className="text-gray-300">¿Qué buscas a cambio?</Label>
              <Input
                id="exchange_for"
                value={formData.exchange_for}
                onChange={(e) => setFormData(prev => ({ ...prev, exchange_for: e.target.value }))}
                className="bg-[#264532] border-[#366348] text-white"
                placeholder="Ej: Pothos, Suculentas"
              />
            </div>
          )}

          <div>
            <Label htmlFor="status" className="text-gray-300">Estado</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="bg-[#264532] border-[#366348] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#264532] border-[#366348] text-white">
                {statusOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#366348]">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#38e07b] hover:bg-[#2dc76a] text-[#122118] font-bold"
          >
            <Edit size={16} className="mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1b3124] border-[#366348] text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">¿Eliminar anuncio?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  Esta acción no se puede deshacer. El anuncio será eliminado permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-[#264532] border-[#366348] text-white hover:bg-[#366348]">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlantDialog;