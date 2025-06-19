
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
}

const Header = ({ title, showSearch = false }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-plant-200 sticky top-0 z-40">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-plant bg-clip-text text-transparent">
            {title}
          </h1>
        </div>
        
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar plantas..."
              className="pl-10 bg-plant-50 border-plant-200 focus:border-plant-400"
            />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
