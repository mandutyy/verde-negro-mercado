
import { useMemo, memo } from 'react';
import { Heart, Home, MessageCircle, Upload, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navigation = memo(() => {
  const location = useLocation();
  
  const navItems = useMemo(() => [
    { icon: Home, label: 'Inicio', path: '/', id: 'home' },
    { icon: Upload, label: 'Publicar', path: '/upload', id: 'upload' },
    { icon: Heart, label: 'Favoritos', path: '/favorites', id: 'favorites' },
    { icon: MessageCircle, label: 'Mensajes', path: '/messages', id: 'messages' },
    { icon: User, label: 'Perfil', path: '/profile', id: 'profile' },
  ], []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50">
      <div className="flex border-t border-[#264532] bg-[#1b3124] px-4 pb-3 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive 
                  ? "text-[#38e07b]" 
                  : "text-[#96c5a9] hover:text-[#38e07b]"
              )}
            >
              <Icon size={24} />
              <p className={cn(
                "text-xs leading-normal tracking-[0.015em]",
                isActive ? "font-bold" : "font-medium"
              )}>
                {item.label}
              </p>
            </Link>
          );
        })}
      </div>
      <div className="h-5 bg-[#1b3124]"></div>
    </footer>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
