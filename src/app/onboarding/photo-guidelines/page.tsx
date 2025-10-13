"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { Camera, CheckCircle, Wrench, Eye } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";

export default function PhotoGuidelinesPage() {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboardingProgress();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentStep(OnboardingStep.PHOTO_GUIDELINES);
  }, [setCurrentStep]);
  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();
  useEffect(() => {
    setLeftButton({ label: "Atrás", onClick: () => handleBack() });
    setRightButton({
      label: "Continuar",
      onClick: () => handleContinue(),
      disabled: isLoading,
    });
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleBack = () => {
    // Navigate back to specialty-selection but go to the zone section
    navigate("/onboarding/specialty-selection?section=zone");
  };

  const handleExit = () => {
    navigate("/");
  };

  const handleContinue = async () => {
    setIsLoading(true);
    navigate("/onboarding/photo-upload");
    // Loading will be reset when component unmounts
  };

  const goodPractices = [
    {
      icon: Camera,
      title: "Antes y después",
      description: "Muestra la transformación de tus proyectos",
    },
    {
      icon: CheckCircle,
      title: "Trabajos terminados",
      description: "Demuestra la calidad de tu trabajo finalizado",
    },
    {
      icon: Eye,
      title: "Vos trabajando",
      description: "Genera confianza mostrándote en acción",
    },
    {
      icon: Wrench,
      title: "Herramientas/equipos",
      description: "Exhibe las herramientas que dominás",
    },
  ];

  return (
    <div className='flex-1 flex flex-col overflow-auto'>
      <div className='w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 md:px-4 md:py-6'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Title */}
          <div className='mb-4 md:mb-6 text-left'>
            <h1 className='text-lg md:text-xl text-foreground mb-1 md:mb-2'>
              Mostrá tus mejores trabajos
            </h1>
            <p className='text-xs md:text-sm text-muted-foreground'>
              Subí fotos que demuestren tu calidad y experiencia
            </p>
          </div>

          {/* Content */}
          <div>
            {/* Good practices */}
            <div>
              <h2 className='text-sm md:text-base font-semibold text-foreground mb-2 md:mb-4'>
                Qué fotos funcionan mejor:
              </h2>
              <div className='space-y-2 md:space-y-3'>
                {goodPractices.map((practice, index) => (
                  <motion.div
                    key={practice.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className='flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-2xl bg-white border border-border shadow-sm'
                  >
                    <div className='flex-shrink-0 w-9 h-9 md:w-10 md:h-10 bg-primary/10 rounded-xl flex items-center justify-center'>
                      <practice.icon className='w-5 h-5 md:w-5 md:h-5 text-primary' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-semibold text-foreground text-sm md:text-base mb-0.5 md:mb-1'>
                        {practice.title}
                      </h3>
                      <p className='text-[10px] md:text-sm text-muted-foreground'>
                        {practice.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
