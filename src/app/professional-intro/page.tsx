"use client";

import { useNavigate } from '@/src/shared/lib/navigation';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@/src/shared/components/ui/loading-button';
import { Button } from '@/src/shared/components/ui/button';
import { User, Star, Camera, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingProgressBar } from '@/src/shared/components/OnboardingProgressBar';
import { useOnboardingProgress, OnboardingStep } from '@/src/shared/stores/useOnboardingProgressStore';

export default function ProfessionalIntroPage() {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboardingProgress();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setCurrentStep(OnboardingStep.PROFESSIONAL_INTRO);
  }, [setCurrentStep]);

  const handleStart = async () => {
    setIsLoading(true);
    navigate('/specialty-selection');
    // Loading will be reset when component unmounts
  };

  const handleBack = () => {
    navigate('/user-type-selection');
  };

  const handleExit = () => {
    navigate('/');
  };

  const steps = [
    {
      number: 1,
      title: "Seleccioná tu especialidad",
      description: "Elegí el servicio principal que ofreces para que los clientes puedan encontrarte fácilmente.",
      icon: Settings,
      color: "bg-blue-50 text-blue-600"
    },
    {
      number: 2,
      title: "Mostrá tu experiencia subiendo fotos",
      description: "Subí al menos 2 fotos de trabajos realizados que demuestren tu calidad y experiencia profesional.",
      icon: Camera,
      color: "bg-green-50 text-green-600"
    },
    {
      number: 3,
      title: "Completá tus datos personales",
      description: "Compartí algunos datos básicos como tu nombre, teléfono y ubicación para que los clientes puedan contactarte.",
      icon: User,
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-4 py-3 md:px-8 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleExit}
            className="px-4 py-1.5 md:px-4 md:py-2 text-sm md:text-sm bg-white border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200"
          >
            Salir
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 md:px-4 md:py-6 flex flex-col min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col"
        >
          {/* Steps */}
          <div className="flex-1 overflow-auto scrollbar-hide">
            <div className="space-y-4 md:space-y-6">
              {/* Title inside scrollable area */}
              <div className="mb-4 md:mb-6">
                <h1 className="text-lg md:text-xl text-foreground text-left">
                  Comenzar como experto es fácil
                </h1>
              </div>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex gap-3 md:gap-4 bg-white/50 rounded-2xl p-4 md:p-4 border border-border/20"
              >
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-5 h-5 md:w-5 md:h-5" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-2 mb-1 md:mb-2">
                    <span className="text-base md:text-lg font-semibold text-foreground">
                      {step.number}
                    </span>
                    <h2 className="text-sm md:text-base font-semibold text-foreground">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-sm md:text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer with Progress Bar */}
      <div className="flex-shrink-0 w-full bg-background/95 backdrop-blur-sm">
        {/* Progress Bar */}
        <OnboardingProgressBar />

        {/* Footer Buttons */}
        <div className="w-full px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm md:text-sm text-black hover:text-gray-700 underline font-medium"
            >
              Atrás
            </button>
            <LoadingButton
              onClick={handleStart}
              loading={isLoading}
              disabled={isLoading}
              className="px-8 h-11 text-sm md:px-8 md:h-12 md:text-base font-medium"
            >
              Continuar
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}