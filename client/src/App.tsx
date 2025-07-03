import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { ConnectionError } from "@/components/ui/connection-error";
import Dashboard from "@/pages/dashboard";
import Stores from "@/pages/stores";
import Sales from "@/pages/sales";
import Objectives from "@/pages/objectives-simple";
import Employees from "@/pages/employees-simple";
import Reports from "@/pages/reports";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/stores" component={Stores} />
      <Route path="/sales" component={Sales} />
      <Route path="/objectives" component={Objectives} />
      <Route path="/employees" component={Employees} />
      <Route path="/reports" component={Reports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { isOpen, toggle, close } = useMobileMenu();
  const [location, setLocation] = useLocation();
  
  // Verificar si las variables de entorno están configuradas
  const hasSupabaseConfig = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Proteger rutas
  useEffect(() => {
    if (location !== "/login" && localStorage.getItem("isLoggedIn") !== "true") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  if (!hasSupabaseConfig) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <ConnectionError />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {location === "/login" ? (
          <Login />
        ) : (
          <div className="min-h-screen flex bg-gray-50">
            <Sidebar isOpen={isOpen} onClose={close} />
            <div className="flex-1 lg:ml-0">
              <Header onMenuToggle={toggle} />
              <main className="min-h-[calc(100vh-73px)]">
                <Router />
              </main>
            </div>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
