"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useEffect, useState } from "react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import { User, Camera, Settings } from "lucide-react";
import { motion } from "framer-motion";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";
import { useEffect as useLayoutEffect } from "react";
import { useOnboardingFooterStore } from "@/src/shared/stores/useOnboardingFooterStore";

export default function ProfessionalIntroPage() {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboardingProgress();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentStep(OnboardingStep.PROFESSIONAL_INTRO);
  }, [setCurrentStep]);

  const { setLeftButton, setRightButton, reset } = useOnboardingFooterStore();

  useEffect(() => {
    setLeftButton({ label: "Atrás", onClick: () => handleBack() });
    setRightButton({
      label: "Continuar",
      onClick: () => handleStart(),
      loading: isLoading,
      disabled: isLoading,
    });
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const handleStart = async () => {
    setIsLoading(true);
    navigate("/onboarding/specialty-selection");
    // Loading will be reset when component unmounts
  };

  const handleBack = () => {
    navigate("/onboarding/user-type-selection");
  };

  const handleExit = () => {
    navigate("/");
  };

  const steps = [
    {
      number: 1,
      title: "Seleccioná tu especialidad",
      description:
        "Elegí el servicio principal que ofreces para que los clientes puedan encontrarte fácilmente.",
      icon: Settings,
      color: "bg-blue-50 text-blue-600",
    },
    {
      number: 2,
      title: "Mostrá tu experiencia subiendo fotos",
      description:
        "Subí al menos 2 fotos de trabajos realizados que demuestren tu calidad y experiencia profesional.",
      icon: Camera,
      color: "bg-green-50 text-green-600",
    },
    {
      number: 3,
      title: "Completá tus datos personales",
      description:
        "Compartí algunos datos básicos como tu nombre, teléfono y ubicación para que los clientes puedan contactarte.",
      icon: User,
      color: "bg-purple-50 text-purple-600",
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
          {/* Title */}
          <div className='mb-4 md:mb-6'>
            <h1 className='text-lg md:text-xl text-foreground text-left'>
              Comenzar como experto es fácil
            </h1>
          </div>

          {/* Steps */}
          <div>
            <div className='space-y-4 md:space-y-6'>
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className='flex gap-3 md:gap-4 bg-white/50 rounded-2xl p-4 md:p-4 border border-border/20'
                >
                  {/* Step Number & Icon */}
                  <div className='flex-shrink-0'>
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${step.color} flex items-center justify-center`}
                    >
                      <step.icon className='w-5 h-5 md:w-5 md:h-5' />
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 md:gap-2 mb-1 md:mb-2'>
                      <span className='text-base md:text-lg font-semibold text-foreground'>
                        {step.number}
                      </span>
                      <h2 className='text-sm md:text-base font-semibold text-foreground'>
                        {step.title}
                      </h2>
                    </div>
                    <p className='text-sm md:text-sm text-muted-foreground leading-relaxed'>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
