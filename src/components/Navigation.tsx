
import { useMemo, memo } from 'react';
import { Heart, Home, MessageCircle, Upload, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navigation = memo(() => {
  const location = useLocation();
  
  const navItems = useMemo(() => [
    { icon: Home, label: 'Inicio', path: '/', id: 'home' },
    { icon: Heart, label: 'Favoritos', path: '/favorites', id: 'favorites' },
    { icon: Upload, label: 'Publicar', path: '/upload', id: 'upload' },
    { icon: MessageCircle, label: 'Mensajes', path: '/messages', id: 'messages' },
    { icon: User, label: 'Perfil', path: '/profile', id: 'profile' },
  ], []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex px-2 py-2 safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
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
            </Link>
          );
        })}
      </div>
    </footer>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
