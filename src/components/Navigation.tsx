
import { useMemo, memo, useState } from 'react';
import { Heart, Home, MessageCircle, Upload, User, RefreshCw, DollarSign } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const Navigation = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const navItems = useMemo(() => [
    { icon: Home, label: 'Inicio', path: '/', id: 'home' },
    { icon: Heart, label: 'Favoritos', path: '/favorites', id: 'favorites' },
    { icon: Upload, label: 'Publicar', path: '/upload', id: 'upload' },
    { icon: MessageCircle, label: 'Mensajes', path: '/messages', id: 'messages' },
    { icon: User, label: 'Perfil', path: '/profile', id: 'profile' },
  ], []);

  const handleNavClick = (item: typeof navItems[0]) => {
    if (item.id === 'upload') {
      setIsSheetOpen(true);
    }
  };

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex px-2 py-2 safe-area-pb">
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

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[80vh] bg-[#1a3525] border-t border-[#264532] rounded-t-2xl shadow-[0_-4px_16px_rgba(0,0,0,0.2)] p-4 pt-2">
          <div className="flex justify-center mb-2">
            <div className="w-8 h-1 bg-[#4a755d] rounded-full"></div>
          </div>
          
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white text-center font-bold text-lg">Elige una opción</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-3 gap-3 pb-6">
            <button
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#264532] hover:bg-[#38e07b] group transition-colors focus:bg-[#38e07b] focus:outline-none"
              onClick={() => {
                navigate('/upload?type=sell');
                setIsSheetOpen(false);
              }}
            >
              <DollarSign className="text-[#38e07b] group-hover:text-[#122118] group-focus:text-[#122118] transition-colors" size={32} />
              <span className="text-white group-hover:text-[#122118] group-focus:text-[#122118] text-sm font-semibold transition-colors">Vender</span>
            </button>
            
            <button
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#264532] hover:bg-[#38e07b] group transition-colors focus:bg-[#38e07b] focus:outline-none"
              onClick={() => {
                navigate('/upload?type=gift');
                setIsSheetOpen(false);
              }}
            >
              <Heart className="text-[#38e07b] group-hover:text-[#122118] group-focus:text-[#122118] transition-colors" size={32} />
              <span className="text-white group-hover:text-[#122118] group-focus:text-[#122118] text-sm font-semibold transition-colors">Regalar</span>
            </button>
            
            <button
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-[#264532] hover:bg-[#38e07b] group transition-colors focus:bg-[#38e07b] focus:outline-none"
              onClick={() => {
                navigate('/upload?type=exchange');
                setIsSheetOpen(false);
              }}
            >
              <RefreshCw className="text-[#38e07b] group-hover:text-[#122118] group-focus:text-[#122118] transition-colors" size={32} />
              <span className="text-white group-hover:text-[#122118] group-focus:text-[#122118] text-sm font-semibold transition-colors">Intercambiar</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
