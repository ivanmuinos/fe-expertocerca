"use client";

import { useNavigate } from '@/lib/navigation';
import { useEffect } from 'react';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { User, Star, Camera, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';
import { useOnboardingProgress, OnboardingStep } from '@/stores/useOnboardingProgressStore';

export default function ProfessionalIntro() {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboardingProgress();
  
  useEffect(() => {
    setCurrentStep(OnboardingStep.PROFESSIONAL_INTRO);
  }, [setCurrentStep]);

  const handleStart = () => {
    navigate('/specialty-selection');
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
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleExit}
            className="px-4 py-2 bg-white border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200"
          >
            Salir
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-6 flex flex-col min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 flex flex-col"
        >
          {/* Steps */}
          <div className="flex-1 overflow-auto scrollbar-hide">
            <div className="space-y-6">
              {/* Title inside scrollable area */}
              <div className="mb-6">
                <h1 className="text-xl text-foreground text-left">
                  Comenzar como experto es fácil
                </h1>
              </div>
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="flex gap-4 bg-white/50 rounded-2xl p-4 border border-border/20"
              >
                {/* Step Number & Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-xl ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-semibold text-foreground">
                      {step.number}
                    </span>
                    <h2 className="text-base font-semibold text-foreground">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Progress Bar - Fixed */}
      <OnboardingProgressBar fixed />

      {/* Footer */}
      <div className="flex-shrink-0 w-full bg-background/95 backdrop-blur-sm">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm text-black hover:text-gray-700 underline font-medium"
            >
              Atrás
            </button>
            <LoadingButton
              onClick={handleStart}
              className="px-8 h-12 text-base font-medium"
            >
              Continuar
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}