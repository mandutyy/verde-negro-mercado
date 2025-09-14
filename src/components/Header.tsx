
import { Search, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;
}

const Header = ({ title, showSearch = false, showBackButton = false, onBack }: HeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="bg-white border-b border-plant-200 sticky top-0 z-40">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-10 w-10 p-0"
              >
                <ArrowLeft size={20} />
              </Button>
            )}
            <h1 className="text-lg md:text-2xl font-bold bg-gradient-plant bg-clip-text text-transparent">
              {title}
            </h1>
          </div>
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
