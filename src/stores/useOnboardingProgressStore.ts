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
  // Sub-section tracking
  specialtySection: SpecialtySectionType;
  photoSection: PhotoSectionType;

  // Actions
  setCurrentStep: (step: OnboardingStep) => void;
  setSpecialtySection: (section: SpecialtySectionType) => void;
  setPhotoSection: (section: PhotoSectionType) => void;
  getProgressPercentage: () => number;
  getPreviousProgress: () => number;
  resetProgress: () => void;
}

// Progress mapping with sub-steps - More balanced distribution
const BASE_STEP_PROGRESS: Record<OnboardingStep, number> = {
  [OnboardingStep.PROFESSIONAL_INTRO]: 10,        // 10% (step 1/6)
  [OnboardingStep.SPECIALTY_SELECTION]: 25,       // 25% base (step 2/6)
  [OnboardingStep.PHOTO_GUIDELINES]: 40,          // 40% (step 3/6)
  [OnboardingStep.PHOTO_UPLOAD]: 55,              // 55% base (step 4/6)
  [OnboardingStep.PERSONAL_DATA]: 90,             // 90% (step 5/6) - Almost complete
  [OnboardingStep.COMPLETION]: 100                // 100% (step 6/6)
};

// Sub-section progress increments - Smaller, more proportional
const SPECIALTY_SUB_PROGRESS: Record<SpecialtySectionType, number> = {
  'specialty': 0,  // Base section (25%)
  'zone': 7        // +7% when in zone section (32%)
};

const PHOTO_SUB_PROGRESS: Record<PhotoSectionType, number> = {
  'photos': 0,        // Base section (55%)
  'description': 8    // +8% when in description section (63%)
};

export const useOnboardingProgressStore = create<OnboardingProgressState>()(
  persist(
    (set, get) => ({
      currentStep: OnboardingStep.PROFESSIONAL_INTRO,
      previousProgress: 0,
      specialtySection: 'specialty',
      photoSection: 'photos',

      setCurrentStep: (step: OnboardingStep) => {
        const currentProgress = get().getProgressPercentage();
        set({
          previousProgress: currentProgress,
          currentStep: step
        });
      },

      setSpecialtySection: (section: SpecialtySectionType) => {
        const state = get();
        const currentProgress = state.getProgressPercentage();
        set({
          previousProgress: currentProgress,
          specialtySection: section
        });
      },

      setPhotoSection: (section: PhotoSectionType) => {
        const state = get();
        const currentProgress = state.getProgressPercentage();
        set({
          previousProgress: currentProgress,
          photoSection: section
        });
      },

      getProgressPercentage: () => {
        const state = get();
        let progress = BASE_STEP_PROGRESS[state.currentStep] || 0;

        // Add sub-section progress for specialty selection
        if (state.currentStep === OnboardingStep.SPECIALTY_SELECTION) {
          progress += SPECIALTY_SUB_PROGRESS[state.specialtySection];
        }

        // Add sub-section progress for photo upload
        if (state.currentStep === OnboardingStep.PHOTO_UPLOAD) {
          progress += PHOTO_SUB_PROGRESS[state.photoSection];
        }

        return Math.min(progress, 100); // Cap at 100%
      },

      getPreviousProgress: () => {
        const state = get();
        return state.previousProgress;
      },

      resetProgress: () =>
        set({
          currentStep: OnboardingStep.PROFESSIONAL_INTRO,
          previousProgress: 0,
          specialtySection: 'specialty',
          photoSection: 'photos'
        })
    }),
    {
      name: 'onboarding-progress-storage',
      partialize: (state) => ({
        currentStep: state.currentStep,
        previousProgress: state.previousProgress,
        specialtySection: state.specialtySection,
        photoSection: state.photoSection
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