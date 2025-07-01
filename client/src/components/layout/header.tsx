import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const now = new Date();
  const lastUpdate = now.toLocaleString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <header className="bg-gradient-to-r from-pink-50 to-rose-50 shadow-sm border-b border-pink-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden text-pink-700 hover:text-pink-800 hover:bg-pink-100"
          onClick={onMenuToggle}
        >
          <Menu size={20} />
        </Button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Última actualización: {lastUpdate}
          </span>
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-white" size={16} />
          </div>
        </div>
      </div>
    </header>
  );
}
