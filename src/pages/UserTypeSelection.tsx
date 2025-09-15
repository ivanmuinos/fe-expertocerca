import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star } from "lucide-react";
import { LoadingButton } from "@/components/ui/loading-button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useLoading } from "@/stores/useLoadingStore";

export default function UserTypeSelection() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { withLoading } = useLoading();

  const handleTypeSelection = async (userType: 'customer' | 'professional') => {
    if (!user) return;
    
    try {
      await withLoading(async () => {
        // Verificar si ya existe un perfil para evitar errores de duplicado
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('user_id, user_type, onboarding_completed')
          .eq('user_id', user.id)
          .maybeSingle();

        let error = null;

        if (existingProfile) {
          // Si ya existe, hacer un update
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ 
              user_type: userType,
              onboarding_completed: userType === 'customer' // Solo customers completan aquí
            })
            .eq('user_id', user.id);
          error = updateError;
        } else {
          // Si no existe, crear nuevo
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              user_id: user.id,
              user_type: userType,
              onboarding_completed: userType === 'customer',
              full_name: user.user_metadata?.full_name || null,
              avatar_url: user.user_metadata?.avatar_url || null
            });
          error = insertError;
        }

        if (error) throw error;


        // Redirigir según el tipo de usuario
        if (userType === 'professional') {
          navigate('/professional-intro');
        } else {
          navigate('/');
        }
      });
    } catch (error) {
      console.error('Error updating user type:', error);
      console.error('Error updating user type:', error);
    }
  };

  const handleBack = () => {
    // Allow user to go back to home without being forced to complete onboarding
    navigate('/');
  };

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-8 py-4 flex items-center justify-start">
          <button
            onClick={handleBack}
            className="text-sm text-black hover:text-gray-700 underline font-medium"
          >
            Atrás
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              ¿Cómo vas a usar la app?
            </h1>
            <p className="text-muted-foreground">
              Selecciona la opción que mejor te describa
            </p>
          </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Necesito un experto */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
              selectedType === 'customer' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedType('customer')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Necesito un experto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Busco profesionales para mis proyectos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Soy un experto */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
              selectedType === 'professional' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setSelectedType('professional')}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Soy un experto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ofrezco mis servicios profesionales
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Continue Button */}
          <LoadingButton
            onClick={() => selectedType && handleTypeSelection(selectedType as 'customer' | 'professional')}
            disabled={!selectedType}
            className="w-full h-12 text-base font-medium"
          >
            Continuar
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}