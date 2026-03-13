import { Settings, Star, LogIn, Share, Pencil, Leaf, ShoppingBag, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useUserPlants } from '@/hooks/useApi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import UserPlantCard from '@/components/UserPlantCard';
import EditPlantDialog from '@/components/EditPlantDialog';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

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
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('publicaciones');
  const { data: plants = [], isLoading: loading } = useUserPlants();

  const updatePlantMutation = useMutation({
    mutationFn: async ({ plantId, updates }: { plantId: string; updates: Partial<Plant> }) => {
      const { error } = await supabase
        .from('plants')
        .update(updates)
        .eq('id', plantId)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlants', user?.id] });
      toast({ title: "¡Actualizado!", description: "Los cambios se han guardado correctamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo actualizar la planta", variant: "destructive" });
    }
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (plantId: string) => {
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPlants', user?.id] });
      toast({ title: "¡Eliminado!", description: "La planta ha sido eliminada correctamente" });
    },
    onError: () => {
      toast({ title: "Error", description: "No se pudo eliminar la planta", variant: "destructive" });
    }
  });

  const updatePlant = async (plantId: string, updates: Partial<Plant>): Promise<boolean> => {
    try { await updatePlantMutation.mutateAsync({ plantId, updates }); return true; } catch { return false; }
  };

  const deletePlant = async (plantId: string): Promise<boolean> => {
    try { await deletePlantMutation.mutateAsync(plantId); return true; } catch { return false; }
  };

  const [profile, setProfile] = useState<{ name?: string; avatar_url?: string; bio?: string; location?: string; user_type?: string }>({});
  const location = useLocation();

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    const { data } = await supabase
      .from('profiles')
      .select('name, avatar_url, bio, location, user_type')
      .eq('user_id', user.id)
      .maybeSingle();
    if (data) {
      setProfile({
        name: data.name || undefined,
        avatar_url: data.avatar_url || undefined,
        bio: data.bio || undefined,
        location: data.location || undefined,
        user_type: (data as any).user_type || 'particular',
      });
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile, location.key]);

  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const handleEditPlant = (plant: Plant) => { setEditingPlant(plant); setEditDialogOpen(true); };
  const handleCloseEditDialog = () => { setEditingPlant(null); setEditDialogOpen(false); };

  const handleShareApp = async () => {
    const shareData = {
      title: 'Plantificar - Compra y vende plantas',
      text: '¡Descubre Plantificar! La mejor app para comprar, vender e intercambiar plantas.',
      url: window.location.origin
    };
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        return;
      }
    } catch { /* fallback */ }
    try {
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      toast({ title: "¡Enlace copiado!", description: "Compártelo con tus amigos." });
    } catch {
      toast({ title: "Comparte Plantificar", description: `Copia este enlace: ${window.location.origin}` });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="flex items-center justify-center p-4 pb-2 glass-strong sticky top-0 z-10">
          <h1 className="text-foreground text-base font-bold">Perfil</h1>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="bg-card border border-border/50 rounded-2xl p-8 text-center w-full max-w-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
              <LogIn size={28} className="text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Inicia sesión</h2>
            <p className="text-muted-foreground text-sm mb-6">Accede a tu cuenta para ver tu perfil</p>
            <Button onClick={() => navigate('/auth')} className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-11">
              <LogIn size={16} className="mr-2" />
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'publicaciones', label: 'Plantas', icon: Leaf, count: plants.length },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'compras', label: 'Compras', icon: ShoppingBag },
  ];

  const displayName = profile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-background text-foreground font-spline">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 glass-strong sticky top-0 z-10">
        <div className="w-10" />
        <h1 className="text-foreground text-base font-bold">Perfil</h1>
        <button
          onClick={() => navigate('/settings')}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted transition-colors"
        >
          <Settings size={20} />
        </button>
      </header>

      {/* Profile Hero */}
      <div className="relative px-4 pt-4 pb-6">
        {/* Avatar + Edit */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/30 shadow-lg shadow-primary/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-muted border-2 border-border flex items-center justify-center">
                <Leaf size={32} className="text-primary/50" />
              </div>
            )}
            <button
              onClick={() => navigate('/edit-profile')}
              className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md"
            >
              <Pencil size={12} />
            </button>
          </div>

          <h2 className="text-lg font-bold text-foreground">{displayName}</h2>

          {profile.user_type && profile.user_type !== 'particular' && (
            <span className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold mt-1',
              profile.user_type === 'floristeria' ? 'bg-pink-500/20 text-pink-400' : 'bg-primary/20 text-primary'
            )}>
              {profile.user_type === 'floristeria' ? '💐 Floristería' : '🌿 Vivero'}
            </span>
          )}

          {profile.location && (
            <p className="text-muted-foreground text-xs mt-0.5">{profile.location}</p>
          )}

          {profile.bio && (
            <p className="text-muted-foreground text-xs text-center mt-2 max-w-[260px] leading-relaxed line-clamp-2">
              {profile.bio}
            </p>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex flex-col items-center">
              <span className="text-foreground text-sm font-bold">{plants.length}</span>
              <span className="text-muted-foreground text-[10px]">Plantas</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-1">
              <Star size={13} className="text-amber-400 fill-amber-400" />
              <span className="text-foreground text-sm font-bold">4.8</span>
              <span className="text-muted-foreground text-[10px]">(125)</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex flex-col items-center">
              <span className="text-foreground text-sm font-bold">120</span>
              <span className="text-muted-foreground text-[10px]">Seguidores</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 w-full max-w-xs">
            <Button
              onClick={() => navigate('/edit-profile')}
              variant="outline"
              className="flex-1 h-9 rounded-xl border-border bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted"
            >
              <Pencil size={13} className="mr-1.5" />
              Editar perfil
            </Button>
            <Button
              onClick={handleShareApp}
              variant="outline"
              className="flex-1 h-9 rounded-xl border-border bg-muted/50 text-foreground text-xs font-semibold hover:bg-muted"
            >
              <Share size={13} className="mr-1.5" />
              Compartir
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <div className="flex bg-muted/40 rounded-xl p-1 gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all",
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon size={14} />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                    isActive ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-28">
        {activeTab === 'publicaciones' && (
          <>
            {loading ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-card border border-border/30 animate-pulse">
                    <div className="aspect-square bg-muted" />
                    <div className="p-2.5 space-y-2">
                      <div className="h-3 bg-muted rounded-full w-3/4" />
                      <div className="h-2.5 bg-muted rounded-full w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : plants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                  <Leaf size={28} className="text-primary/60" />
                </div>
                <h3 className="text-foreground text-sm font-bold mb-1">No hay publicaciones aún</h3>
                <p className="text-muted-foreground text-xs mb-5 text-center">Publica tu primera planta</p>
                <Button
                  onClick={() => navigate('/upload')}
                  className="bg-primary text-primary-foreground font-bold rounded-xl h-10 px-5 text-sm"
                >
                  Publicar planta
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {plants.map(plant => (
                  <UserPlantCard key={plant.id} plant={plant} onEdit={handleEditPlant} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'ventas' && (
          <EmptyTab icon="💰" title="Historial de ventas" description="Aquí verás tus ventas completadas" />
        )}

        {activeTab === 'compras' && (
          <EmptyTab icon="🛒" title="Historial de compras" description="Aquí verás tus compras realizadas" />
        )}
      </div>

      <EditPlantDialog plant={editingPlant} isOpen={editDialogOpen} onClose={handleCloseEditDialog} onUpdate={updatePlant} onDelete={deletePlant} />
    </div>
  );
};

const EmptyTab = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
      <span className="text-2xl">{icon}</span>
    </div>
    <h3 className="text-foreground text-sm font-bold mb-1">{title}</h3>
    <p className="text-muted-foreground text-xs text-center">{description}</p>
  </div>
);

export default Profile;
