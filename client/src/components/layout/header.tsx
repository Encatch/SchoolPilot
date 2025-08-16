import { Bell, Search, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4" data-testid="header">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
          <Menu className="h-5 w-5" />
        </Button>
        <h2 className="ml-2 text-2xl font-semibold text-gray-900" data-testid="header-title">{title}</h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500 relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full flex items-center justify-center text-white text-xs">
            3
          </span>
        </Button>
        
        <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-500" data-testid="button-search">
          <Search className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700" data-testid="welcome-message">
            Welcome back, <span className="font-medium">{user?.firstName || 'User'}</span>
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="p-1 rounded-full text-gray-400 hover:text-gray-500" data-testid="button-logout">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
