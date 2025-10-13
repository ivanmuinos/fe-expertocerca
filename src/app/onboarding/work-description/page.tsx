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

export default function WorkDescriptionPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { workDescription, setWorkDescription, markStepCompleted } =
    useOnboarding();
  const { setCurrentStep } = useOnboardingProgress();
  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();

  useEffect(() => {
    setCurrentStep(OnboardingStep.PHOTO_UPLOAD);
  }, [setCurrentStep]);

  const handleBack = () => {
    navigate("/onboarding/photo-upload");
  };

  const handleContinue = () => {
    setIsLoading(true);
    markStepCompleted(4);
    navigate("/onboarding/personal-data");
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
