"use client";

import { CheckCircle, Home, FileText } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { OnboardingStep } from "./OnboardingStep";
import { useNavigate } from "@/src/shared/lib/navigation";

export interface CompletionStepProps {
  userType: "customer" | "professional";
  userName?: string;
}

export function CompletionStep({ userType, userName }: CompletionStepProps) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoToPublications = () => {
    navigate("/mis-publicaciones");
  };

  return (
    <OnboardingStep>
      <div className='text-center space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-2xl text-foreground'>
            ¡Perfecto, {userName || "todo está listo"}! 🎉
          </h2>
          <p className='text-lg text-muted-foreground'>
            {userType === "professional"
              ? "Tu perfil profesional está configurado. Ahora puedes empezar a recibir solicitudes de clientes."
              : "Tu perfil está listo. Ahora puedes buscar y contratar expertos para tus proyectos."}
          </p>
        </div>

        <div className='pt-4'>
          {userType === "professional" ? (
            <div className='space-y-3'>
              <Button
                onClick={handleGoToPublications}
                className='w-full h-12 text-base'
                size='lg'
              >
                <FileText className='w-5 h-5 mr-2' />
                Ver mis publicaciones
              </Button>
              <Button
                onClick={handleGoHome}
                variant='outline'
                className='w-full h-12 text-base'
                size='lg'
              >
                <Home className='w-5 h-5 mr-2' />
                Ir al inicio
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleGoHome}
              className='w-full h-12 text-base'
              size='lg'
            >
              <Home className='w-5 h-5 mr-2' />
              Empezar a buscar expertos
            </Button>
          )}
        </div>

        <div className='pt-4 border-t border-border'>
          <p className='text-sm text-muted-foreground'>
            {userType === "professional"
              ? "Recuerda completar tu perfil y agregar fotos de tus trabajos para atraer más clientes."
              : "Podés cambiar tu información de perfil en cualquier momento desde la configuración."}
          </p>
        </div>
      </div>
    </OnboardingStep>
  );
}
