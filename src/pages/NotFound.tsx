"use client";

import { useNavigate } from "@/lib/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SharedHeader } from "@/components/SharedHeader";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const [pathname, setPathname] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (pathname) {
      console.error(
        "404 Error: User attempted to access non-existent route:",
        pathname
      );
    }
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader showBackButton={true} title="Página no encontrada" />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl font-bold text-primary mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Página no encontrada
          </h1>
          <p className="text-muted-foreground mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver atrás
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Ir al inicio
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
