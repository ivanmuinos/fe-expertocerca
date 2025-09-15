"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Chrome } from 'lucide-react';
import { useProfiles } from '@/hooks/useProfiles';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  
  const { signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getProfile } = useProfiles();

  // Initialize search params client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  // Redirect after auth: go to onboarding if not completed
  useEffect(() => {
    const run = async () => {
      if (!user || !searchParams) return;
      const { data } = await getProfile(user.id);
      const nextUrl = searchParams.get('next');
      if (!data || data.onboarding_completed !== true) {
        navigate('/onboarding');
      } else {
        navigate(nextUrl || '/');
      }
    };
    run();
  }, [user, getProfile, navigate, searchParams]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Error al iniciar sesión",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
    }
  };






  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-primary/20 to-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-accent/15 to-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-secondary/30 to-muted/20 rounded-full blur-2xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-border/50 p-8">
            <div className="space-y-8">
              {/* Logo and title */}
              <div className="text-center space-y-4">
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                  Experto<span className="text-primary"> Cerca</span>
                </h1>
                <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                  Bienvenido
                </h2>
                <p className="text-lg text-muted-foreground">
                  Inicia sesión para continuar
                </p>
              </div>

              {/* Auth button */}
              <div className="space-y-4">
                <Button 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  size="lg"
                  className="w-full h-14 text-lg font-medium bg-[#4285F4] hover:bg-[#3367D6] disabled:bg-[#4285F4]/70 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Conectando con Google...
                    </>
                  ) : (
                    <>
                      <Chrome className="mr-3 h-5 w-5" />
                      Continuar con Google
                    </>
                  )}
                </Button>
              </div>

              {/* Footer links */}
              <div className="text-center space-y-4">
                <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                  <button className="hover:text-foreground transition-colors">
                    Términos de servicio
                  </button>
                  <button className="hover:text-foreground transition-colors">
                    Política de privacidad
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}