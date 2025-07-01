import { Link, useLocation } from "wouter";
import { Store, ChartPie, ScanBarcode, Target, Users, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMobileMenu } from "@/hooks/use-mobile-menu";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: ChartPie },
    { name: "Tiendas", href: "/stores", icon: Store },
    { name: "Ventas", href: "/sales", icon: ScanBarcode },
    { name: "Objetivos", href: "/objectives", icon: Target },
    { name: "Empleados", href: "/employees", icon: Users },
    { name: "Reportes", href: "/reports", icon: FileText },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "bg-gradient-to-b from-pink-50 to-rose-50 shadow-lg w-64 min-h-screen transition-all duration-300 ease-in-out lg:relative absolute z-30 border-r border-pink-200",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-pink-200">
          <h1 className="text-xl font-bold text-pink-800 flex items-center">
            <Store className="text-pink-600 mr-2" size={20} />
            Boutique Manager
          </h1>
        </div>
        
        <nav className="mt-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center px-6 py-3 text-pink-700 hover:bg-pink-100 hover:text-pink-800 transition-colors",
                  isActive && "border-r-2 border-pink-600 bg-gradient-to-r from-pink-200 to-rose-200 text-pink-800 shadow-sm"
                )}
              >
                <Icon className="mr-3" size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
