"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { LoadingButton } from '@/src/shared/components/ui/loading-button';
import { Button } from '@/src/shared/components/ui/button';
import { Star, Camera, CheckCircle, Wrench, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { OnboardingProgressBar } from '@/src/shared/components/OnboardingProgressBar';
import { useOnboardingProgress, OnboardingStep } from '@/src/shared/stores/useOnboardingProgressStore';

export default function PhotoGuidelines() {
  const navigate = useNavigate();
  const { setCurrentStep } = useOnboardingProgress();
  
  useEffect(() => {
    setCurrentStep(OnboardingStep.PHOTO_GUIDELINES);
  }, [setCurrentStep]);

  const handleBack = () => {
    // Navigate back to specialty-selection but go to the zone section
    navigate('/specialty-selection?section=zone');
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleContinue = () => {
    navigate('/photo-upload');
  };

  const goodPractices = [
    {
      icon: Camera,
      title: 'Antes y después',
      description: 'Muestra la transformación de tus proyectos'
    },
    {
      icon: CheckCircle,
      title: 'Trabajos terminados',
      description: 'Demuestra la calidad de tu trabajo finalizado'
    },
    {
      icon: Eye,
      title: 'Vos trabajando',
      description: 'Genera confianza mostrándote en acción'
    },
    {
      icon: Wrench,
      title: 'Herramientas/equipos',
      description: 'Exhibe las herramientas que dominás'
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
          {/* Main Title */}
          <div className="mb-6 text-left">
            <h1 className="text-xl text-foreground mb-2">
              Mostrá tus mejores trabajos
            </h1>
            <p className="text-muted-foreground">
              Subí fotos que demuestren tu calidad y experiencia
            </p>
          </div>

          {/* Content scrollable area */}
          <div className="flex-1 overflow-auto scrollbar-hide">
            {/* Good practices */}
            <div>
              <h2 className="text-base font-semibold text-foreground mb-4">
                Qué fotos funcionan mejor:
              </h2>
              <div className="space-y-3">
                {goodPractices.map((practice, index) => (
                  <motion.div
                    key={practice.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border shadow-sm"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <practice.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-base mb-1">
                        {practice.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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
              onClick={handleContinue}
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