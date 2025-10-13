"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Search, Star, LogOut } from "lucide-react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import { useAuthState, useAuthActions } from "@/src/features/auth";
import { apiClient } from "@/src/shared/lib/api-client";
import { useLoading } from "@/src/shared/stores/useLoadingStore";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { Button } from "@/src/shared/components/ui/button";

export default function UserTypeSelectionPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(true);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(true);
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { withLoading } = useLoading();

  // Check if user is first time (no user_type set yet)
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return;

      setIsCheckingStatus(true);
      try {
        const profile = await apiClient.get("/profiles/current");
        // If user already has a user_type, they're not first time
        setIsFirstTime(!(profile as any)?.user_type);
      } catch (error) {
        // If error, assume first time
        setIsFirstTime(true);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkUserStatus();
  }, [user]);

  const handleTypeSelection = async (userType: "customer" | "professional") => {
    if (!user) return;

    try {
      await withLoading(async () => {
        await apiClient.setUserType(userType);

        // Redirigir según el tipo de usuario
        if (userType === "professional") {
          navigate("/onboarding/professional-intro");
        } else {
          navigate("/");
        }
      });
    } catch (error) {
      // Error updating user type
    }
  };

  const handleBack = () => {
    // Step sin botón atrás (header/footer ocultos por layout)
  };

  return (
    <>
      <div className='flex-1 flex items-center justify-center p-4 pb-14'>
        <div className='w-full max-w-md space-y-6'>
          {/* Header */}
          <div className='text-left space-y-2'>
            <h1 className='text-lg md:text-xl font-normal text-foreground'>
              ¿Cómo vas a usar la app?
            </h1>
            <p className='text-xs md:text-sm text-muted-foreground'>
              Selecciona la opción que mejor te describa
            </p>
          </div>

          {/* Options */}
          <div className='space-y-4'>
            {/* Necesito un experto */}
            {isCheckingStatus ? (
              <Card className='animate-pulse'>
                <CardContent className='p-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0 w-12 h-12 bg-gray-200 rounded-xl' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-5 bg-gray-200 rounded w-3/4' />
                      <div className='h-4 bg-gray-200 rounded w-full' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : isFirstTime ? (
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                  selectedType === "customer"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedType("customer")}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                      <Search className='h-6 w-6 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-foreground mb-1'>
                        Necesito un experto
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Busco profesionales para mis proyectos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className='cursor-not-allowed transition-all duration-200 opacity-60 relative'>
                <CardContent className='p-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center'>
                      <Search className='h-6 w-6 text-gray-400' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-2 mb-1'>
                        <h3 className='text-lg font-semibold text-gray-600'>
                          Necesito un experto
                        </h3>
                        <span className='px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full'>
                          Próximamente
                        </span>
                      </div>
                      <p className='text-sm text-gray-400'>
                        Busco profesionales para mis proyectos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Soy un experto */}
            {isCheckingStatus ? (
              <Card className='animate-pulse'>
                <CardContent className='p-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0 w-12 h-12 bg-gray-200 rounded-xl' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-5 bg-gray-200 rounded w-2/3' />
                      <div className='h-4 bg-gray-200 rounded w-full' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card
                className={`cursor-pointer transition-all duration-200 hover:shadow-elevated ${
                  selectedType === "professional"
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedType("professional")}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center space-x-4'>
                    <div className='flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center'>
                      <Star className='h-6 w-6 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='text-lg font-semibold text-foreground mb-1'>
                        Soy un experto
                      </h3>
                      <p className='text-sm text-muted-foreground'>
                        Ofrezco mis servicios profesionales
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Continue Button - Fixed at bottom */}
      <div className='fixed bottom-0 left-0 right-0 z-30 w-full h-14 px-4 bg-background/95 backdrop-blur-sm flex items-center justify-center'>
        <div className='w-full max-w-md'>
          <LoadingButton
            onClick={() =>
              selectedType &&
              handleTypeSelection(selectedType as "customer" | "professional")
            }
            disabled={!selectedType}
            className='w-full h-9 text-sm font-medium'
          >
            Continuar
          </LoadingButton>
        </div>
      </div>
    </>
  );
}
