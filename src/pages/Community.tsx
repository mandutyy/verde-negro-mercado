import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Heart, MessageCircle, Plus, Leaf, HelpCircle, Camera, BookOpen, ArrowLeft, Send, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const POST_CATEGORIES = [
  { value: 'general', label: 'General', icon: Leaf },
  { value: 'consejos', label: 'Consejos', icon: BookOpen },
  { value: 'ayuda', label: 'Ayuda', icon: HelpCircle },
  { value: 'evolucion', label: 'Evolución', icon: Camera },
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
}

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState('general');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [newComment, setNewComment] = useState('');

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['communityPosts', activeCategory],
    queryFn: async () => {
      let query = supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (activeCategory !== 'general') {
        query = query.eq('category', activeCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as CommunityPost[];
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch profiles for posts
  const userIds = [...new Set(posts.map(p => p.user_id))];
  const { data: profiles = {} } = useQuery({
    queryKey: ['postProfiles', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return {};
      const { data } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);
      const map: Record<string, { name: string; avatar_url: string | null }> = {};
      data?.forEach(p => { map[p.user_id] = { name: p.name || 'Usuario', avatar_url: p.avatar_url }; });
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
        .order('created_at', { ascending: true });
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

  // Create post
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('community_posts').insert({
        user_id: user.id,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      setShowNewPost(false);
      setNewPost({ title: '', content: '', category: 'general' });
      toast({ title: '¡Publicado!', description: 'Tu post se ha creado correctamente' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear el post', variant: 'destructive' });
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

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `hace ${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `hace ${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `hace ${days}d`;
  };

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
          <Button
            onClick={() => setShowNewPost(true)}
            size="sm"
            className="bg-primary text-primary-foreground rounded-full h-8 px-3 text-xs font-bold"
          >
            <Plus size={14} className="mr-1" />
            Publicar
          </Button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 px-4 py-2 overflow-x-auto scrollbar-hide">
          {POST_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
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
      </div>

      {/* Posts Feed */}
      <div className="flex-1 px-4 pt-3 pb-24 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl p-4 border border-border/40 animate-pulse space-y-3">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-full bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-muted rounded w-1/3" />
                  <div className="h-2 bg-muted rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Leaf size={32} className="text-primary opacity-60" />
            </div>
            <h3 className="text-foreground text-sm font-bold mb-1">No hay publicaciones aún</h3>
            <p className="text-muted-foreground text-xs mb-4">¡Sé el primero en compartir algo!</p>
            <Button onClick={() => setShowNewPost(true)} className="bg-primary text-primary-foreground rounded-full text-xs font-bold">
              <Plus size={14} className="mr-1" /> Crear publicación
            </Button>
          </div>
        ) : (
          posts.map((post) => {
            const profile = profiles[post.user_id];
            const isLiked = userLikes.includes(post.id);
            return (
              <div key={post.id} className="bg-card rounded-xl p-4 border border-border/40 space-y-3">
                {/* Author */}
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {(profile?.name || 'U')[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm font-semibold truncate">{profile?.name || 'Usuario'}</p>
                    <p className="text-muted-foreground text-[10px]">{formatTimeAgo(post.created_at)}</p>
                  </div>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-bold',
                    post.category === 'consejos' ? 'bg-blue-500/20 text-blue-400' :
                    post.category === 'ayuda' ? 'bg-amber-500/20 text-amber-400' :
                    post.category === 'evolucion' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-primary/20 text-primary'
                  )}>
                    {POST_CATEGORIES.find(c => c.value === post.category)?.label || 'General'}
                  </span>
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-foreground text-sm font-bold mb-1">{post.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed line-clamp-4">{post.content}</p>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {post.images.map((img, i) => (
                      <img key={i} src={img} alt="" className="h-32 rounded-lg object-cover" />
                    ))}
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
      </div>

      {/* New Post Sheet */}
      <Sheet open={showNewPost} onOpenChange={setShowNewPost}>
        <SheetContent side="bottom" className="h-[85vh] bg-card border-t border-border rounded-t-2xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-foreground text-base font-bold">Nueva publicación</SheetTitle>
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
              <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                {POST_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setNewPost(prev => ({ ...prev, category: cat.value }))}
                    className={cn(
                      'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-all',
                      newPost.category === cat.value
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-muted-foreground border border-border/30'
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <Input
                placeholder="Título de tu publicación"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl h-12"
                maxLength={100}
              />

              <Textarea
                placeholder="¿Qué quieres compartir con la comunidad?"
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-xl min-h-[200px] resize-none"
                maxLength={2000}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Comments Sheet */}
      <Sheet open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <SheetContent side="bottom" className="h-[75vh] bg-card border-t border-border rounded-t-2xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-4 pt-4 pb-3 border-b border-border/50">
              <SheetTitle className="text-foreground text-sm font-bold">
                Comentarios ({selectedPost?.comments_count || 0})
              </SheetTitle>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {comments.length === 0 ? (
                <p className="text-muted-foreground text-xs text-center py-8">No hay comentarios aún. ¡Sé el primero!</p>
              ) : (
                comments.map((comment) => {
                  const cp = commentProfiles[comment.user_id];
                  return (
                    <div key={comment.id} className="flex gap-2.5">
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarImage src={cp?.avatar_url || ''} />
                        <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                          {(cp?.name || 'U')[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-xs font-semibold">{cp?.name || 'Usuario'}</span>
                          <span className="text-muted-foreground text-[10px]">{formatTimeAgo(comment.created_at)}</span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5">{comment.content}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Comment input */}
            <div className="p-3 border-t border-border/50 flex gap-2">
              <Input
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-muted border-border/50 text-foreground placeholder:text-muted-foreground rounded-full h-10 text-xs"
                maxLength={500}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    addCommentMutation.mutate();
                  }
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
