import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Simple step enumeration matching actual pages
export enum OnboardingStep {
  PROFESSIONAL_INTRO = 'professional-intro',
  SPECIALTY_SELECTION = 'specialty-selection',
  PHOTO_GUIDELINES = 'photo-guidelines',
  PHOTO_UPLOAD = 'photo-upload',
  PERSONAL_DATA = 'personal-data',
  COMPLETION = 'completion'
}

// Sub-step definitions for multi-section pages
export type SpecialtySectionType = 'specialty' | 'zone';
export type PhotoSectionType = 'photos' | 'description';

interface OnboardingProgressState {
  currentStep: OnboardingStep;
  previousProgress: number;

  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  getProgressPercentage: () => number;
  getPreviousProgress: () => number;
  resetProgress: () => void;
}

// Simple progress mapping - Each step is equal
const STEP_ORDER = [
  OnboardingStep.PROFESSIONAL_INTRO,
  OnboardingStep.SPECIALTY_SELECTION,
  OnboardingStep.PHOTO_GUIDELINES,
  OnboardingStep.PHOTO_UPLOAD,
  OnboardingStep.PERSONAL_DATA,
  OnboardingStep.COMPLETION
];

const TOTAL_STEPS = STEP_ORDER.length;

// Calculate progress based on step position
const calculateStepProgress = (step: OnboardingStep): number => {
  const stepIndex = STEP_ORDER.indexOf(step);
  if (stepIndex === -1) return 0;
  
  // Each step represents equal progress
  const progressPerStep = 100 / TOTAL_STEPS;
  return Math.round((stepIndex + 1) * progressPerStep);
};

export const useOnboardingProgressStore = create<OnboardingProgressState>()(
  persist(
    (set, get) => ({
      currentStep: OnboardingStep.PROFESSIONAL_INTRO,
      previousProgress: 0,

      setCurrentStep: (step: OnboardingStep) => {
        const currentProgress = get().getProgressPercentage();
        set({
          previousProgress: currentProgress,
          currentStep: step
        });
      },

      getProgressPercentage: () => {
        const state = get();
        return calculateStepProgress(state.currentStep);
      },

      getPreviousProgress: () => {
        const state = get();
        return state.previousProgress;
      },

      resetProgress: () =>
        set({
          currentStep: OnboardingStep.PROFESSIONAL_INTRO,
          previousProgress: 0
        })
    }),
    {
      name: 'onboarding-progress-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        previousProgress: state.previousProgress
      }),
      // Skip hydration to prevent SSR mismatches
      skipHydration: true,
    }
  )
);

// Custom hook for easier usage with hydration handling
export const useOnboardingProgress = () => {
  const store = useOnboardingProgressStore();
  const [isHydrated, setIsHydrated] = React.useState(false);

  // Manually rehydrate on client side to prevent SSR mismatches
  React.useEffect(() => {
    useOnboardingProgressStore.persist.rehydrate();
    setIsHydrated(true);
  }, []);

  return {
    ...store,
    isHydrated
  };
};