"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { motion } from "framer-motion";
import { useOnboarding } from "@/src/shared/stores/useOnboardingStore";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";
import { useAuthState } from "@/src/features/auth";

export default function WorkDescriptionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [shouldShowPersonalData, setShouldShowPersonalData] = useState<boolean | null>(null);
  const { workDescription, setWorkDescription, markStepCompleted } =
    useOnboarding();
  const { setCurrentStep } = useOnboardingProgress();
  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();
  const { user } = useAuthState();

  useEffect(() => {
    setCurrentStep(OnboardingStep.PHOTO_UPLOAD);
  }, [setCurrentStep]);

  // Check if user already has profile data on mount
  useEffect(() => {
    const checkUserData = async () => {
      if (!user) return;

      try {
        // Check if user has whatsapp_phone and professional profiles
        const [profileResponse, professionalResponse] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/professionals/my")
        ]);

        if (profileResponse.ok && professionalResponse.ok) {
          const { data: profile } = await profileResponse.json();
          const { data: professionals } = await professionalResponse.json();

          // Show personal-data only if:
          // 1. No whatsapp_phone OR
          // 2. No professional profiles (first time)
          const hasWhatsapp = profile?.whatsapp_phone;
          const hasProfessionals = professionals && professionals.length > 0;

          setShouldShowPersonalData(!hasWhatsapp || !hasProfessionals);
        } else {
          // If APIs fail, default to showing personal-data
          setShouldShowPersonalData(true);
        }
      } catch (error) {
        console.error("Error checking user data:", error);
        // Default to showing personal-data on error
        setShouldShowPersonalData(true);
      }
    };

    checkUserData();
  }, [user]);

  const handleBack = () => {
    navigate("/onboarding/photo-upload");
  };

  const handleContinue = () => {
    setIsLoading(true);
    markStepCompleted(4);

    // Navigate based on whether user needs to fill personal data
    if (shouldShowPersonalData) {
      navigate("/onboarding/personal-data");
    } else {
      // Skip personal-data and go straight to completion
      navigate("/onboarding/completion");
    }
  };

  const canProceed = workDescription.trim().length >= 50;

  useEffect(() => {
    setLeftButton({ label: "Atrás", onClick: handleBack });
    setRightButton({
      label: "Continuar",
      onClick: handleContinue,
      disabled: !canProceed || isLoading,
      loading: isLoading,
    });
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canProceed, isLoading]);

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 md:px-4 md:py-6 flex flex-col min-h-full'
        >
          {/* Section Title */}
          <div className='mb-4 md:mb-6 text-left'>
            <h1 className='text-lg md:text-xl text-foreground mb-1 md:mb-2'>
              Describí los trabajos que realizás
            </h1>
            <p className='text-xs md:text-sm text-muted-foreground'>
              Contá a tus potenciales clientes sobre tu experiencia y los
              servicios que ofrecés
            </p>
          </div>

          {/* Work Description Textarea */}
          <div className='flex-1 flex flex-col'>
            <Textarea
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              placeholder='Ejemplo: Soy electricista con más de 10 años de experiencia. Me especializo en instalaciones residenciales y comerciales, reparación de averías eléctricas, instalación de aires acondicionados, automatización del hogar y sistemas de iluminación LED.

Trabajo con materiales de primera calidad y ofrezco garantía en todos mis trabajos. Cuento con matrícula profesional y seguro de responsabilidad civil.

Mis clientes destacan mi puntualidad, prolijidad y precio justo. Atiendo zona norte del GBA con disponibilidad de lunes a sábados.'
              className='flex-1 min-h-[200px] max-h-[400px] resize-none text-sm leading-relaxed bg-white/80 backdrop-blur-sm border-2 border-border focus:border-primary rounded-2xl p-4 transition-colors duration-200'
              style={{
                fontFamily: "system-ui, -apple-system, sans-serif",
                lineHeight: "1.6",
              }}
            />
            <div className='mt-2 flex justify-between items-center'>
              <div className='text-xs'>
                {workDescription.trim().length < 50 ? (
                  <span className='text-red-500'>
                    Mínimo 50 caracteres (faltan{" "}
                    {50 - workDescription.trim().length})
                  </span>
                ) : (
                  <span className='text-green-600'>✓ Descripción válida</span>
                )}
              </div>
              <span className='text-xs text-muted-foreground'>
                {workDescription.length}/1000 caracteres
              </span>
            </div>
          </div>
        </motion.div>
    </div>
  );
}
