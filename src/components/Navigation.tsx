
import { useMemo, memo, useState } from 'react';
import { Heart, Home, MessageCircle, Upload, User, Gift, RefreshCw, DollarSign, MoreHorizontal } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

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

  const publishOptions = [
    { 
      icon: DollarSign, 
      label: 'Vender', 
      description: 'Vende tu planta',
      action: () => {
        navigate('/upload?type=sell');
        setIsSheetOpen(false);
      }
    },
    { 
      icon: Gift, 
      label: 'Regalar', 
      description: 'Regala tu planta',
      action: () => {
        navigate('/upload?type=gift');
        setIsSheetOpen(false);
      }
    },
    { 
      icon: RefreshCw, 
      label: 'Intercambiar', 
      description: 'Intercambia tu planta',
      action: () => {
        navigate('/upload?type=exchange');
        setIsSheetOpen(false);
      }
    },
    { 
      icon: MoreHorizontal, 
      label: 'Varias opciones', 
      description: 'Múltiples opciones disponibles',
      action: () => {
        navigate('/upload?type=multiple');
        setIsSheetOpen(false);
      }
    }
  ];

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
        <SheetContent side="bottom" className="h-auto max-h-[80vh] bg-[#1b3124] border-t border-[#264532]">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-white text-center">¿Qué quieres hacer con tu planta?</SheetTitle>
          </SheetHeader>
          
          <div className="grid gap-3 pb-6">
            {publishOptions.map((option) => {
              const OptionIcon = option.icon;
              return (
                <Button
                  key={option.label}
                  variant="ghost"
                  className="h-auto p-4 justify-start bg-[#264532] hover:bg-[#38e07b]/20 text-white border border-[#38e07b]/30"
                  onClick={option.action}
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#38e07b]/20 flex items-center justify-center">
                      <OptionIcon size={20} className="text-[#38e07b]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{option.label}</p>
                      <p className="text-sm text-gray-300">{option.description}</p>
                    </div>
                  </div>
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
});

Navigation.displayName = 'Navigation';

export default Navigation;
