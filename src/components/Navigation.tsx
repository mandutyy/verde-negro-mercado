
import { useState } from 'react';
import { Heart, Home, MessageCircle, Upload, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/', id: 'home' },
    { icon: Upload, label: 'Subir', path: '/upload', id: 'upload' },
    { icon: Heart, label: 'Favoritos', path: '/favorites', id: 'favorites' },
    { icon: MessageCircle, label: 'Mensajes', path: '/messages', id: 'messages' },
    { icon: User, label: 'Perfil', path: '/profile', id: 'profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-plant-200 z-50">
      <div className="flex justify-around items-center py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200",
                isActive 
                  ? "text-plant-600 bg-plant-50" 
                  : "text-gray-500 hover:text-plant-500 hover:bg-plant-25"
              )}
            >
              <Icon 
                size={24} 
                className={cn(
                  isActive ? "text-plant-600" : "text-gray-500"
                )} 
              />
              <span className={cn(
                "text-xs mt-1 font-medium",
                isActive ? "text-plant-600" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
