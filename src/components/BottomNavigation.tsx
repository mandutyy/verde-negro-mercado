import { useNavigate, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Inicio',
      icon: 'home',
      path: '/'
    },
    {
      id: 'upload',
      label: 'Publicar',
      icon: 'add_circle',
      path: '/upload'
    },
    {
      id: 'messages',
      label: 'Mensajes',
      icon: 'chat_bubble',
      path: '/messages'
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: 'person',
      path: '/profile'
    }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="sticky bottom-0 bg-[#1b3124] w-full z-50">
      <div className="flex justify-around border-t border-[#264532] pt-2 pb-5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-end gap-1 ${
              isActive(item.path) ? 'text-[#38e07b]' : 'text-[#96c5a9]'
            }`}
          >
            <span className="material-symbols-outlined text-3xl">{item.icon}</span>
            <p className={`text-xs leading-normal ${
              isActive(item.path) ? 'font-bold' : 'font-medium'
            }`}>
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;