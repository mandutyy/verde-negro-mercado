
import { useMemo, memo, useState } from 'react';
import { Heart, Home, MessageCircle, Upload, User, RefreshCw, DollarSign, Users, BookOpen } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

const Navigation = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { conversations } = useRealtimeChat();
  
  // Calculate total unread messages
  const totalUnreadMessages = useMemo(() => {
    return conversations.reduce((total, conv) => total + conv.unread_count, 0);
  }, [conversations]);
  
  const navItems = useMemo(() => [
    { icon: Home, label: 'Inicio', path: '/', id: 'home' },
    { icon: Heart, label: 'Gratis', path: '/free-plants', id: 'free-plants' },
    { icon: Upload, label: 'Publicar', path: '/upload', id: 'upload' },
    { icon: Users, label: 'Comunidad', path: '/community', id: 'community' },
    { icon: User, label: 'Perfil', path: '/profile', id: 'profile' },
  ], []);

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'upload') {
      setIsSheetOpen(true);
    }
  };

  const handleOptionSelect = (option: string) => {
    navigate(`/upload?type=${option}`);
    setIsSheetOpen(false);
  };

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50">
        <div className="flex px-2 py-2 pb-safe pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            if (item.id === 'upload') {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 transition-colors py-2 px-1 rounded-lg",
                    isActive 
                      ? "text-primary bg-primary/10" 
                      : "text-secondary hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  <p className={cn(
                    "text-xs leading-tight tracking-wide",
                    isActive ? "font-semibold" : "font-medium"
                  )}>
                    {item.label}
                  </p>
                </button>
              );
            }
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 transition-colors py-2 px-1 rounded-lg relative",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-secondary hover:text-primary hover:bg-primary/5"
                )}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {item.id === 'messages' && totalUnreadMessages > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                      {totalUnreadMessages > 99 ? '99+' : totalUnreadMessages}
                    </div>
                  )}
                </div>
                <p className={cn(
                  "text-xs leading-tight tracking-wide",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </p>
              </Link>
            );
          })}
        </div>
      </footer>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] bg-[#1a3525] border-t border-[#264532] rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.2)] p-4 pt-2">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-1 bg-[#4a755d] rounded-full"></div>
          </div>
          
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white text-center font-bold text-lg">Elige una opción</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-3 gap-3 pb-4">
            <button
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl group transition-colors focus:outline-none bg-muted hover:bg-primary text-foreground hover:text-primary-foreground"
              onClick={() => handleOptionSelect('sell')}
            >
              <DollarSign className="text-primary group-hover:text-primary-foreground transition-colors" size={32} />
              <span className="text-sm font-semibold">Vender</span>
            </button>
            
            <button
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl group transition-colors focus:outline-none bg-muted hover:bg-primary text-foreground hover:text-primary-foreground"
              onClick={() => handleOptionSelect('gift')}
            >
              <Heart className="text-primary group-hover:text-primary-foreground transition-colors" size={32} />
              <span className="text-sm font-semibold">Regalar</span>
            </button>
            
            <button
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl group transition-colors focus:outline-none bg-muted hover:bg-primary text-foreground hover:text-primary-foreground"
              onClick={() => handleOptionSelect('exchange')}
            >
              <RefreshCw className="text-primary group-hover:text-primary-foreground transition-colors" size={32} />
              <span className="text-sm font-semibold">Intercambiar</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
