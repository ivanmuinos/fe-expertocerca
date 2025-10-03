import { ReactNode } from 'react';
import { Button } from '@/src/shared/components/ui/button';
import { LoadingButton } from '@/src/shared/components/ui/loading-button';
import { Check, Star } from 'lucide-react';

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
}

export interface OnboardingLayoutProps {
  children: ReactNode;
  steps: OnboardingStep[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  nextButtonText?: string;
  onExit?: () => void;
}

export function OnboardingLayout({
  children,
  steps,
  currentStep,
  onNext,
  onBack,
  canProceed,
  nextButtonText = "Continuar",
  onExit
}: OnboardingLayoutProps) {
  // Adjust for total flow: ProfessionalIntro (step 1) + SpecialtySelection (step 2) + PhotoGuidelines (step 3) + PhotoUpload (step 4) + onboarding steps (steps 5+)
  const totalSteps = steps.length + 4; // +4 for ProfessionalIntro, SpecialtySelection, PhotoGuidelines and PhotoUpload
  const adjustedCurrentStep = currentStep + 4; // +4 because onboarding starts as step 5
  const progressPercentage = (adjustedCurrentStep / totalSteps) * 100;
  const isLastStep = currentStep === steps.length;

  const handleExit = () => {
    if (onExit) {
      onExit();
    } else {
      // Default exit behavior - navigate back
      onBack();
    }
  };

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
        {/* Content */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          {children}
        </div>
      </div>

      {/* Footer with Progress Bar */}
      <div className="flex-shrink-0 w-full bg-background/95 backdrop-blur-sm">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200">
          <div
            className="h-2 bg-primary transition-[width] duration-1000 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Footer Buttons */}
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-black hover:text-gray-700 underline font-medium"
            >
              Atrás
            </button>
            <LoadingButton
              onClick={onNext}
              disabled={!canProceed}
              className="px-8 h-12 text-base font-medium"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Completar
                </>
              ) : (
                nextButtonText
              )}
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}