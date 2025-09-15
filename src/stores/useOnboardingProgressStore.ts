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

// Progress mapping with sub-steps
const BASE_STEP_PROGRESS: Record<OnboardingStep, number> = {
  [OnboardingStep.PROFESSIONAL_INTRO]: 10,
  [OnboardingStep.SPECIALTY_SELECTION]: 20, // Base, will be modified by sub-sections
  [OnboardingStep.PHOTO_GUIDELINES]: 40,
  [OnboardingStep.PHOTO_UPLOAD]: 50, // Base, will be modified by sub-sections
  [OnboardingStep.PERSONAL_DATA]: 80,
  [OnboardingStep.COMPLETION]: 100
};

// Sub-section progress increments
const SPECIALTY_SUB_PROGRESS: Record<SpecialtySectionType, number> = {
  'specialty': 0,  // Base section (20%)
  'zone': 10       // +10% when in zone section (30%)
};

const PHOTO_SUB_PROGRESS: Record<PhotoSectionType, number> = {
  'photos': 0,        // Base section (50%)
  'description': 10   // +10% when in description section (60%)
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
        const currentProgress = get().getProgressPercentage();
        set({
          previousProgress: currentProgress,
          specialtySection: section
        });
      },

      setPhotoSection: (section: PhotoSectionType) => {
        const currentProgress = get().getProgressPercentage();
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
      })
    }
  )
);

// Custom hook for easier usage
export const useOnboardingProgress = () => {
  const store = useOnboardingProgressStore();
  
  return {
    ...store
  };
};