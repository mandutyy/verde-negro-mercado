import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, MessageCircle, Plus, Leaf, HelpCircle, Camera, BookOpen, ArrowLeft, Send, X, 
  Bug, Store, TreePine, Flower2, RefreshCw, Search, ThumbsUp, Award, Tag, ChevronRight,
  Droplets, Sun, Thermometer, Scissors, Sprout, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

// Forum categories - expanded
const FORUM_CATEGORIES = [
  { value: 'all', label: 'Todos', icon: Leaf, color: 'bg-primary/20 text-primary' },
  { value: 'dudas-cuidado', label: 'Dudas de cuidado', icon: HelpCircle, color: 'bg-amber-500/20 text-amber-400' },
  { value: 'identificacion', label: 'Identificación', icon: Search, color: 'bg-blue-500/20 text-blue-400' },
  { value: 'intercambios', label: 'Intercambios', icon: RefreshCw, color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'floristerias', label: 'Floristerías', icon: Store, color: 'bg-purple-500/20 text-purple-400' },
  { value: 'interior-exterior', label: 'Interior / Exterior', icon: TreePine, color: 'bg-teal-500/20 text-teal-400' },
  { value: 'plagas', label: 'Plagas y hongos', icon: Bug, color: 'bg-red-500/20 text-red-400' },
];

// Care guides data
const GUIDES = [
  {
    id: 'cactus', title: 'Cactus de interior', description: 'Cuidados básicos para tus cactus en casa', icon: '🌵', category: 'suculentas',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Necesitan luz directa al menos 4-6 horas al día. Colócalos cerca de una ventana orientada al sur.' },
      { icon: Droplets, title: 'Riego', content: 'Riega solo cuando el sustrato esté completamente seco. En invierno, reduce a una vez al mes.' },
      { icon: Thermometer, title: 'Temperatura', content: 'Prefieren entre 15-30°C. Evita corrientes de aire frío.' },
      { icon: Bug, title: 'Plagas', content: 'Vigila cochinillas y pulgones. Usa alcohol isopropílico con un bastoncillo para eliminarlas.' },
    ],
  },
  {
    id: 'plantas-oficina', title: 'Plantas de oficina', description: 'Las mejores plantas para espacios con poca luz', icon: '🪴', category: 'interior',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Pothos, sansevieria y zamioculca toleran poca luz. Evita luz directa intensa.' },
      { icon: Droplets, title: 'Riego', content: 'Riega 1-2 veces por semana. Deja secar la capa superior entre riegos.' },
      { icon: Scissors, title: 'Poda', content: 'Retira hojas amarillas regularmente. Poda en primavera para fomentar el crecimiento.' },
      { icon: Thermometer, title: 'Ambiente', content: 'Mantén la humedad con un pulverizador. El aire acondicionado puede resecarlas.' },
    ],
  },
  {
    id: 'suculentas', title: 'Suculentas', description: 'Guía completa para suculentas felices', icon: '🌿', category: 'suculentas',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Luz brillante indirecta o directa suave. Gira la maceta cada semana para crecimiento uniforme.' },
      { icon: Droplets, title: 'Riego', content: 'Método "remoja y seca": riega abundantemente y espera a que se seque totalmente. Cada 10-14 días.' },
      { icon: Thermometer, title: 'Sustrato', content: 'Usa sustrato específico para suculentas con buen drenaje. Mezcla perlita con tierra.' },
      { icon: Scissors, title: 'Propagación', content: 'Corta una hoja sana, deja cicatrizar 2-3 días y colócala sobre sustrato húmedo.' },
    ],
  },
  {
    id: 'aromaticas', title: 'Plantas aromáticas', description: 'Cultiva tus propias hierbas en casa', icon: '🌱', category: 'exterior',
    tips: [
      { icon: Sun, title: 'Luz', content: 'Necesitan mínimo 6 horas de sol directo. Albahaca, romero y tomillo aman el sol.' },
      { icon: Droplets, title: 'Riego', content: 'Mantén el sustrato ligeramente húmedo. La albahaca necesita más agua que el romero.' },
      { icon: Scissors, title: 'Cosecha', content: 'Corta las puntas regularmente para fomentar el crecimiento. Nunca cortes más del 30%.' },
      { icon: Bug, title: 'Plagas', content: 'Planta albahaca cerca de tomates para repeler moscas. El romero repele mosquitos.' },
    ],
  },
  {
    id: 'poco-riego', title: 'Plantas de poco riego', description: 'Perfectas para olvidadizos del riego', icon: '💧', category: 'interior',
    tips: [
      { icon: Leaf, title: 'Mejores opciones', content: 'Sansevieria, ZZ plant, aloe vera, crasas y cactus son las más resistentes a la sequía.' },
      { icon: Droplets, title: 'Riego', content: 'Una vez cada 2-3 semanas es suficiente. En invierno incluso menos. Mejor poco que demasiado.' },
      { icon: Thermometer, title: 'Sustrato', content: 'Usa macetas con agujeros de drenaje. El exceso de agua es su peor enemigo.' },
      { icon: Sun, title: 'Ubicación', content: 'La mayoría tolera poca luz pero crece mejor con luz indirecta brillante.' },
    ],
  },
  {
    id: 'exterior', title: 'Jardín exterior', description: 'Consejos para tu jardín o terraza', icon: '🌳', category: 'exterior',
    tips: [
      { icon: Sun, title: 'Planificación', content: 'Observa las horas de sol en cada zona. Agrupa plantas con necesidades similares.' },
      { icon: Droplets, title: 'Riego', content: 'Riega temprano por la mañana o al atardecer. Evita mojar las hojas para prevenir hongos.' },
      { icon: Scissors, title: 'Mantenimiento', content: 'Poda las plantas al final del invierno. Abona en primavera y otoño.' },
      { icon: Bug, title: 'Control natural', content: 'Atrae mariquitas y abejas con flores. Usa jabón potásico para pulgones.' },
    ],
  },
];

const GUIDE_CATEGORIES = [
  { value: 'all', label: 'Todas', icon: Leaf },
  { value: 'interior', label: 'Interior', icon: Flower2 },
  { value: 'exterior', label: 'Exterior', icon: TreePine },
  { value: 'suculentas', label: 'Suculentas', icon: Sprout },
];

interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  images: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  tags: string[];
  best_answer_id: string | null;
}

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  vote_count: number;
}

const POPULAR_TAGS = ['#cactus', '#interior', '#plagas', '#regalo', '#intercambio', '#suculentas', '#exterior', '#riego', '#esquejes', '#monstera'];

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Main tab: foros vs guias
  const [mainTab, setMainTab] = useState<'foros' | 'guias'>('foros');
  
  // Forum state
  const [activeCategory, setActiveCategory] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'dudas-cuidado', tags: '' });
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Guide state
  const [guideCategory, setGuideCategory] = useState('all');
  const [selectedGuide, setSelectedGuide] = useState<typeof GUIDES[0] | null>(null);

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts', activeCategory],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activeCategory !== 'all') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CommunityPost[];
    },
    staleTime: 2 * 60 * 1000,
    enabled: mainTab === 'foros',
  });

  // Filtered posts by search
  const filteredPosts = searchQuery.trim()
    ? posts.filter(p => 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : posts;

  // Fetch profiles for posts
  const userIds = [...new Set(filteredPosts.map(p => p.user_id))];
  const { data: profiles = {} } = useQuery({
    queryKey: ['postProfiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url, user_type')
        .in('user_id', userIds);
      const map: Record<string, { name: string; avatar_url: string | null; user_type: string | null }> = {};
      data?.forEach(p => { map[p.user_id] = { name: p.name || 'Usuario', avatar_url: p.avatar_url, user_type: p.user_type }; });
      return map;
    },
    enabled: userIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch user likes
  const { data: userLikes = [] } = useQuery({
    queryKey: ['userPostLikes', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);
      return data?.map(l => l.post_id) || [];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch comments for selected post
  const { data: comments = [] } = useQuery({
    queryKey: ['postComments', selectedPost?.id],
    queryFn: async () => {
      if (!selectedPost) return [];
      const { data } = await supabase
        .from('post_comments')
        .select('*')
        .eq('post_id', selectedPost.id)
        .order('vote_count', { ascending: false });
      return (data || []) as PostComment[];
    },
    enabled: !!selectedPost,
  });

  // Fetch comment author profiles
  const commentUserIds = [...new Set(comments.map(c => c.user_id))];
  const { data: commentProfiles = {} } = useQuery({
    queryKey: ['commentProfiles', commentUserIds],
    queryFn: async () => {
      if (commentUserIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', commentUserIds);
      const map: Record<string, { name: string; avatar_url: string | null }> = {};
      data?.forEach(p => { map[p.user_id] = { name: p.name || 'Usuario', avatar_url: p.avatar_url }; });
      return map;
    },
    enabled: commentUserIds.length > 0,
  });

  // User votes on comments
  const { data: userVotes = [] } = useQuery({
    queryKey: ['userCommentVotes', selectedPost?.id, user?.id],
    queryFn: async () => {
      if (!user || !selectedPost) return [];
      const commentIds = comments.map(c => c.id);
      if (commentIds.length === 0) return [];
      const { data } = await supabase
        .from('comment_votes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', commentIds);
      return data?.map(v => v.comment_id) || [];
    },
    enabled: !!user && comments.length > 0,
  });

  // Create post
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const tags = newPost.tags.split(',').map(t => t.trim().toLowerCase()).filter(t => t.length > 0).map(t => t.startsWith('#') ? t : `#${t}`);
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        tags,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'dudas-cuidado', tags: '' });
      toast({ title: '¡Publicado!', description: 'Tu hilo se ha creado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear el hilo', variant: 'destructive' });
    },
  });

  // Toggle like
  const toggleLikeMutation = useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Not authenticated');
      const isLiked = userLikes.includes(postId);
      if (isLiked) {
        await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      }
      return !isLiked;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPostLikes'] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    },
  });

  // Add comment
  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedPost) throw new Error('Missing data');
      const { error } = await supabase.from('post_comments').insert({
        post_id: selectedPost.id,
        user_id: user.id,
        content: newComment.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', selectedPost?.id] });
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setNewComment('');
    },
  });

  // Vote on comment
  const voteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error('Not authenticated');
      const hasVoted = userVotes.includes(commentId);
      if (hasVoted) {
        await supabase.from('comment_votes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      } else {
        await supabase.from('comment_votes').insert({ comment_id: commentId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCommentVotes'] });
      queryClient.invalidateQueries({ queryKey: ['postComments', selectedPost?.id] });
    },
  });

  // Mark best answer
  const markBestAnswerMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user || !selectedPost) throw new Error('Missing data');
      if (selectedPost.user_id !== user.id) throw new Error('Only post author can mark best answer');
      const newBestId = selectedPost.best_answer_id === commentId ? null : commentId;
      const { error } = await supabase.from('community_posts').update({ best_answer_id: newBestId }).eq('id', selectedPost.id);
      if (error) throw error;
      return newBestId;
    },
    onSuccess: (newBestId) => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setSelectedPost(prev => prev ? { ...prev, best_answer_id: newBestId } : null);
      toast({ title: newBestId ? '✅ Mejor respuesta marcada' : 'Mejor respuesta desmarcada' });
    },
  });

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
  };

  // Guide detail view
  if (selectedGuide) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-background font-spline overflow-x-hidden">
        <header className="sticky top-0 z-20 glass-strong px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSelectedGuide(null)} className="text-foreground hover:bg-muted rounded-full p-1.5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <span className="text-2xl">{selectedGuide.icon}</span>
          <h1 className="text-foreground text-base font-bold flex-1">{selectedGuide.title}</h1>
        </header>
        <div className="flex-1 px-4 pt-4 pb-24 space-y-4">
          <p className="text-muted-foreground text-sm">{selectedGuide.description}</p>
          {selectedGuide.tips.map((tip, i) => {
            const Icon = tip.icon;
            return (
              <div key={i} className="bg-card rounded-xl p-4 border border-border/40">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <h3 className="text-foreground text-sm font-bold">{tip.title}</h3>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">{tip.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const filteredGuides = guideCategory === 'all' ? GUIDES : GUIDES.filter(g => g.category === guideCategory);

  const getCategoryInfo = (catValue: string) => FORUM_CATEGORIES.find(c => c.value === catValue);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-spline overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-strong">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="text-foreground hover:bg-muted rounded-full p-1.5 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
              <Leaf size={16} className="text-primary" />
            </div>
            <h1 className="text-foreground text-base font-bold">Comunidad</h1>
          </div>
          {mainTab === 'foros' && (
            <Button
              onClick={() => setShowNewPost(true)}
              size="sm"
              className="bg-primary text-primary-foreground rounded-full h-8 px-3 text-xs font-bold"
            >
              <Plus size={14} className="mr-1" />
              Nuevo hilo
            </Button>
          )}
        </div>

        {/* Main Tabs: Foros / Guías */}
        <div className="flex px-4 gap-1">
          <button
            onClick={() => setMainTab('foros')}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold text-center rounded-t-lg transition-all',
              mainTab === 'foros'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            💬 Foros
          </button>
          <button
            onClick={() => setMainTab('guias')}
            className={cn(
              'flex-1 py-2.5 text-sm font-bold text-center rounded-t-lg transition-all',
              mainTab === 'guias'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            📖 Guías rápidas
          </button>
        </div>

        {/* Sub-tabs per section */}
        {mainTab === 'foros' ? (
          <>
            {/* Search bar */}
            <div className="px-4 pt-2">
              <div className="flex items-center rounded-full bg-muted/80 border border-border/50 px-3 gap-2 h-9">
                <Search size={14} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Buscar hilos, etiquetas, especies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-foreground text-xs placeholder:text-muted-foreground w-full outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-muted-foreground">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
            {/* Forum categories */}
            <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
              {FORUM_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setActiveCategory(cat.value)}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                        : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border/30'
                    )}
                  >
                    <Icon size={12} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={cn('text-[11px] whitespace-nowrap', isActive ? 'font-bold' : 'font-medium')}>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
            {GUIDE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = guideCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setGuideCategory(cat.value)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted border border-border/30'
                  )}
                >
                  <Icon size={13} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn('text-xs', isActive ? 'font-bold' : 'font-medium')}>{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-3 pb-24 space-y-3">
        {mainTab === 'foros' ? (
          // FOROS TAB
          <>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border/40 animate-pulse space-y-3">
                  <div className="flex gap-3 items-center">
                    <div className="w-9 h-9 rounded-full bg-muted" />
                    <div className="space-y-1.5 flex-1"><div className="h-3 bg-muted rounded w-1/3" /><div className="h-2 bg-muted rounded w-1/4" /></div>
                  </div>
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Leaf size={32} className="text-primary opacity-60" />
                </div>
                <h3 className="text-foreground text-sm font-bold mb-1">
                  {searchQuery ? 'Sin resultados' : 'No hay hilos aún'}
                </h3>
                <p className="text-muted-foreground text-xs mb-4">
                  {searchQuery ? 'Prueba con otros términos' : '¡Sé el primero en abrir un hilo!'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowNewPost(true)} className="bg-primary text-primary-foreground rounded-full text-xs font-bold">
                    <Plus size={14} className="mr-1" /> Crear hilo
                  </Button>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => {
                const profile = profiles[post.user_id];
                const isLiked = userLikes.includes(post.id);
                const catInfo = getCategoryInfo(post.category);
                return (
                  <div key={post.id} className="bg-card rounded-xl p-4 border border-border/40 space-y-3">
                    {/* Author */}
                    <div className="flex items-center gap-2.5">
                      <Link to={`/user-profile/${post.user_id}`}>
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={profile?.avatar_url || ''} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                            {(profile?.name || 'U')[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Link to={`/user-profile/${post.user_id}`} className="text-foreground text-sm font-semibold truncate hover:underline">
                            {profile?.name || 'Usuario'}
                          </Link>
                          {profile?.user_type && profile.user_type !== 'particular' && (
                            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
                              {profile.user_type === 'floristeria' ? '🌸 Floristería' : '🌿 Vivero'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-[10px]">{formatTimeAgo(post.created_at)}</p>
                      </div>
                      {catInfo && (
                        <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold', catInfo.color)}>
                          {catInfo.label}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div onClick={() => setSelectedPost(post)} className="cursor-pointer">
                      <h3 className="text-foreground text-sm font-bold mb-1">{post.title}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">{post.content}</p>
                    </div>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {post.tags.map((tag, i) => (
                          <button
                            key={i}
                            onClick={() => setSearchQuery(tag)}
                            className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Images */}
                    {post.images && post.images.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {post.images.map((img, i) => (
                          <img key={i} src={img} alt="" className="h-32 rounded-lg object-cover" />
                        ))}
                      </div>
                    )}

                    {/* Best answer indicator */}
                    {post.best_answer_id && (
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                        <Award size={12} />
                        <span>Tiene mejor respuesta</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-1">
                      <button
                        onClick={() => toggleLikeMutation.mutate(post.id)}
                        className={cn(
                          'flex items-center gap-1.5 text-xs transition-colors',
                          isLiked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
                        )}
                      >
                        <Heart size={16} className={isLiked ? 'fill-current' : ''} />
                        <span>{post.likes_count}</span>
                      </button>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span>{post.comments_count}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        ) : (
          // GUÍAS TAB
          <>
            {filteredGuides.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setSelectedGuide(guide)}
                className="w-full bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
              >
                <span className="text-3xl">{guide.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground text-sm font-bold">{guide.title}</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">{guide.description}</p>
                  <div className="flex items-center gap-1 mt-1.5 text-primary text-[10px] font-semibold">
                    <span>{guide.tips.length} consejos</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground shrink-0" />
              </button>
            ))}
          </>
        )}
      </div>

      {/* New Post Sheet */}
      <Sheet open={showNewPost} onOpenChange={setShowNewPost}>
        <SheetContent side="bottom" className="h-[85vh] bg-card border-t border-border rounded-t-2xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-foreground text-base font-bold">Nuevo hilo</SheetTitle>
                <Button
                  onClick={() => createPostMutation.mutate()}
                  disabled={!newPost.title.trim() || !newPost.content.trim() || createPostMutation.isPending}
                  size="sm"
                  className="bg-primary text-primary-foreground rounded-full h-8 px-4 text-xs font-bold"
                >
                  {createPostMutation.isPending ? 'Publicando...' : 'Publicar'}
                </Button>
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Category selector */}
              <div>
                <label className="text-foreground text-xs font-semibold mb-2 block">Categoría</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {FORUM_CATEGORIES.filter(c => c.value !== 'all').map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        onClick={() => setNewPost(prev => ({ ...prev, category: cat.value }))}
                        className={cn(
                          'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] transition-all',
                          newPost.category === cat.value
                            ? 'bg-primary text-primary-foreground font-bold'
                            : 'bg-muted text-muted-foreground border border-border/30'
                        )}
                      >
                        <Icon size={12} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Input
                placeholder="Título del hilo"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl h-12"
                maxLength={100}
              />

              <Textarea
                placeholder="Describe tu duda, comparte tu experiencia o pide ayuda..."
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl min-h-[160px] resize-none"
                maxLength={2000}
              />

              {/* Tags input */}
              <div>
                <label className="text-foreground text-xs font-semibold mb-2 block">
                  <Tag size={12} className="inline mr-1" />
                  Etiquetas (separadas por coma)
                </label>
                <Input
                  placeholder="cactus, interior, riego..."
                  value={newPost.tags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl h-10"
                />
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {POPULAR_TAGS.slice(0, 6).map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const current = newPost.tags ? newPost.tags.split(',').map(t => t.trim()) : [];
                        const tagClean = tag.replace('#', '');
                        if (!current.includes(tagClean)) {
                          setNewPost(prev => ({ ...prev, tags: [...current, tagClean].filter(Boolean).join(', ') }));
                        }
                      }}
                      className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Thread Detail / Comments Sheet */}
      <Sheet open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <SheetContent side="bottom" className="h-[85vh] bg-card border-t border-border rounded-t-2xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
              <SheetTitle className="text-foreground text-sm font-bold text-left">
                {selectedPost?.title}
              </SheetTitle>
              {selectedPost && (
                <p className="text-muted-foreground text-xs text-left mt-1 line-clamp-3">{selectedPost.content}</p>
              )}
              {selectedPost?.tags && selectedPost.tags.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {selectedPost.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </SheetHeader>

            <div className="px-4 py-2 text-muted-foreground text-[11px] font-semibold border-b border-border/30">
              {comments.length} respuesta{comments.length !== 1 ? 's' : ''}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-8">No hay respuestas aún. ¡Sé el primero!</p>
              ) : (
                comments.map((comment) => {
                  const cp = commentProfiles[comment.user_id];
                  const isBestAnswer = selectedPost?.best_answer_id === comment.id;
                  const hasVoted = userVotes.includes(comment.id);
                  const isPostAuthor = selectedPost?.user_id === user?.id;
                  return (
                    <div key={comment.id} className={cn(
                      'rounded-xl p-3 border transition-all',
                      isBestAnswer
                        ? 'border-emerald-500/50 bg-emerald-500/5'
                        : 'border-border/30 bg-muted/20'
                    )}>
                      {isBestAnswer && (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold mb-2">
                          <Award size={12} />
                          <span>Mejor respuesta</span>
                        </div>
                      )}
                      <div className="flex gap-2.5">
                        {/* Vote column */}
                        <div className="flex flex-col items-center gap-0.5 pt-1">
                          <button
                            onClick={() => voteCommentMutation.mutate(comment.id)}
                            className={cn(
                              'p-1 rounded transition-colors',
                              hasVoted ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                            )}
                          >
                            <ThumbsUp size={14} className={hasVoted ? 'fill-current' : ''} />
                          </button>
                          <span className="text-[11px] font-bold text-foreground">{comment.vote_count || 0}</span>
                        </div>
                        
                        {/* Comment content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 shrink-0">
                              <AvatarImage src={cp?.avatar_url || ''} />
                              <AvatarFallback className="bg-muted text-muted-foreground text-[9px]">
                                {(cp?.name || 'U')[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground text-xs font-semibold">{cp?.name || 'Usuario'}</span>
                            <span className="text-muted-foreground text-[10px]">{formatTimeAgo(comment.created_at)}</span>
                          </div>
                          <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed">{comment.content}</p>
                          
                          {/* Mark as best answer button (only for post author) */}
                          {isPostAuthor && (
                            <button
                              onClick={() => markBestAnswerMutation.mutate(comment.id)}
                              className={cn(
                                'flex items-center gap-1 mt-2 text-[10px] font-semibold transition-colors',
                                isBestAnswer ? 'text-emerald-400' : 'text-muted-foreground hover:text-emerald-400'
                              )}
                            >
                              <Award size={11} />
                              {isBestAnswer ? 'Quitar mejor respuesta' : 'Marcar como mejor respuesta'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment input */}
            <div className="p-3 border-t border-border/50 flex gap-2">
              <Input
                placeholder="Escribe tu respuesta..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-full h-10 text-xs"
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) addCommentMutation.mutate();
                }}
              />
              <Button
                onClick={() => newComment.trim() && addCommentMutation.mutate()}
                disabled={!newComment.trim() || addCommentMutation.isPending}
                size="sm"
                className="bg-primary text-primary-foreground rounded-full h-10 w-10 p-0 shrink-0"
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Community;
