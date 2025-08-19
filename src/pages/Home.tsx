
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import PlantCard from '@/components/PlantCard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  MapPin,
  Heart,
  MessageCircle,
  Leaf,
  Sprout,
  TreePine,
  Flower,
  User,
  Bell,
  Settings,
  LogOut,
  Camera,
  Star,
  ArrowUpDown,
  Eye,
  Clock,
  Zap,
  TrendingUp,
  MoreHorizontal,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newListingType, setNewListingType] = useState<"sell" | "buy" | "exchange">("sell");
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set(["2", "5"]));

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const toggleLike = (id: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const categories = [
    { value: "all", label: "Todas", icon: Leaf },
    { value: "interior", label: "Interior", icon: Sprout },
    { value: "exterior", label: "Exterior", icon: TreePine },
    { value: "suculentas", label: "Suculentas", icon: Flower },
    { value: "frutales", label: "Con flor", icon: Flower },
  ];
  
  const mockPlants = [
    {
      id: '1',
      title: 'Monstera Deliciosa - Planta adulta 2 años',
      price: '€45',
      location: 'Madrid Centro',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop'
      ],
      category: 'interior',
      condition: 'excellent',
      seller: 'PlantLover23',
      rating: 4.8,
      isLiked: false,
      type: 'sell' as const,
      description: 'Monstera deliciosa adulta de 2 años, muy sana y con muchas hojas fenestradas. Incluye maceta de cerámica.',
      timeAgo: 'hace 2h',
      views: 127,
      distance: '0.5 km',
      isPromoted: true,
      tags: ['Entrega a domicilio', 'Negociable']
    },
    {
      id: '2',
      title: 'Colección de suculentas variadas',
      price: 'Intercambio',
      location: 'Barcelona',
      image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop',
      images: ['https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop'],
      category: 'suculentas',
      condition: 'good',
      seller: 'SucculentSwap',
      rating: 4.9,
      isLiked: true,
      type: 'exchange' as const,
      description: 'Colección de suculentas variadas. Busco intercambiar por cactus de diferentes tamaños.',
      timeAgo: 'hace 3h',
      views: 89,
      distance: '1.2 km',
      isUrgent: true,
      tags: ['Intercambio directo', 'Sin envío']
    },
    {
      id: '3',
      title: 'Ficus Lyrata en maceta decorativa',
      price: '€35',
      location: 'Valencia',
      image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop',
      images: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop'],
      category: 'interior',
      condition: 'excellent',
      seller: 'OrchidExpert',
      rating: 4.7,
      isLiked: false,
      type: 'sell' as const,
      description: 'Hermosa Ficus Lyrata con 8 hojas grandes. Muy fácil de cuidar, perfecta para principiantes.',
      timeAgo: 'hace 5h',
      views: 213,
      distance: '3.8 km',
      tags: ['Incluye maceta', 'Saludable']
    },
    {
      id: '4',
      title: 'Pothos dorado - Muy sano',
      price: '€15',
      location: 'Sevilla',
      image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=300&fit=crop',
      images: ['https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&h=300&fit=crop'],
      category: 'interior',
      condition: 'excellent',
      seller: 'PropagationPro',
      rating: 4.6,
      isLiked: false,
      type: 'sell' as const,
      description: 'Lote de 5 esquejes de Pothos: dorado, mármol, neon y plateado. Ya enraizados y listos para plantar.',
      timeAgo: 'hace 1 día',
      views: 156,
      distance: '0.8 km',
      tags: ['Lote', 'Enraizados']
    },
    {
      id: '5',
      title: 'Palmera Areca - Decorativa',
      price: '€60',
      location: 'Bilbao',
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop',
      images: ['https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=300&fit=crop'],
      category: 'interior',
      condition: 'excellent',
      seller: 'PlantCollector',
      rating: 4.4,
      isLiked: true,
      type: 'sell' as const,
      description: 'Palmera Areca grande y decorativa para salones amplios.',
      timeAgo: 'hace 2 días',
      views: 67,
      distance: '5.2 km',
      isUrgent: false,
      tags: ['Planta grande', 'Decorativa']
    },
    {
      id: '6',
      title: 'Sansevieria - Perfecta para principiantes',
      price: 'Intercambio',
      location: 'Málaga',
      image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop',
      images: ['https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=300&fit=crop'],
      category: 'interior',
      condition: 'excellent',
      seller: 'EasyPlants',
      rating: 4.8,
      isLiked: false,
      type: 'exchange' as const,
      description: 'Sansevieria resistente, perfecta para oficinas y espacios con poca luz.',
      timeAgo: 'hace 3 días',
      views: 89,
      distance: '2.1 km',
      isUrgent: false,
      tags: ['Resistente', 'Poca luz']
    }
  ];

  const typeColors = {
    sell: "bg-emerald-100 text-emerald-700 border-emerald-200",
    buy: "bg-teal-100 text-teal-700 border-teal-200",
    exchange: "bg-cyan-100 text-cyan-700 border-cyan-200"
  };

  const typeLabels = {
    sell: "Venta",
    buy: "Busco",
    exchange: "Intercambio"
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/50 to-emerald-50/30">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PlantSwap</h1>
                <p className="text-xs text-muted-foreground">Compra, vende e intercambia plantas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/edit-profile')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => navigate('/auth')}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-background/60 backdrop-blur-sm rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar plantas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            {/* Category Filter */}
            <Select value={activeCategory} onValueChange={setActiveCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Type Filter */}
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="sell">Venta</SelectItem>
                <SelectItem value="buy">Busco</SelectItem>
                <SelectItem value="exchange">Intercambio</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-background/60 backdrop-blur-sm rounded-lg border border-border p-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span>1.2k vistas hoy</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                <span>24 nuevos anuncios</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span>156 conversaciones activas</span>
              </div>
            </div>
            <div className="text-primary font-medium">
              ¡Encuentra tu planta perfecta cerca de ti!
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Anuncios Recientes</h2>
            <p className="text-sm text-muted-foreground">{mockPlants.length} resultados encontrados</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Ordenar
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Publicar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
                  <DialogDescription>
                    Publica tu planta para vender, comprar o intercambiar
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de anuncio</label>
                    <Select value={newListingType} onValueChange={(value: "sell" | "buy" | "exchange") => setNewListingType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sell">Vender</SelectItem>
                        <SelectItem value="buy">Buscar</SelectItem>
                        <SelectItem value="exchange">Intercambiar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Título</label>
                    <input
                      type="text"
                      placeholder="Ej: Monstera Deliciosa en perfecto estado"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Descripción</label>
                    <Textarea
                      placeholder="Describe tu planta, estado, cuidados..."
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Precio</label>
                    <input
                      type="text"
                      placeholder="€25 o 'Intercambio'"
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate('/upload')}>
                    <Camera className="h-4 w-4 mr-2" />
                    Añadir Fotos y Publicar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Plant Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
          {mockPlants.map((listing) => (
            <PlantCard 
              key={listing.id}
              id={listing.id}
              title={listing.title}
              price={typeof listing.price === 'string' ? parseFloat(listing.price.replace('€', '')) || 0 : listing.price}
              location={listing.location}
              image={listing.image}
              isFavorite={likedItems.has(listing.id)}
              isExchange={listing.type === 'exchange'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
