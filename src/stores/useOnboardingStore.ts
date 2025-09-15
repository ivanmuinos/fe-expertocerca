import { create } from "zustand";
import { persist } from "zustand/middleware";

// Interface para las fotos cargadas
export interface OnboardingPhoto {
  id: string;
  file: File;
  url: string;
  uploading?: boolean;
  uploaded?: boolean;
  supabaseUrl?: string;
  error?: string;
  deleting?: boolean;
  portfolioPhotoId?: string; // ID from portfolio_photos table
}

// Interface para la información personal
export interface OnboardingPersonalInfo {
  fullName: string;
  phone: string;
  locationProvince: string;
  locationCity: string;
}

// Interface para la información profesional
export interface OnboardingProfessionalInfo {
  bio: string;
  skills: string[];
  tradeName: string;
  yearsExperience: number;
  hourlyRate: number;
}

// Estado completo del onboarding
interface OnboardingState {
  // Specialty selection step
  selectedSpecialty: string | null;
  selectedWorkZone: string | null;

  // Photo upload step
  uploadedPhotos: OnboardingPhoto[];
  uploadingPhotos: Set<string>;
  deletingPhotos: Set<string>;
  workDescription: string; // Work description for professional profile

  // Personal info step
  personalInfo: OnboardingPersonalInfo;

  // Professional info step
  professionalInfo: OnboardingProfessionalInfo;

  // Progress tracking
  currentStep: number;
  completedSteps: Set<number>;

  // Actions
  setSpecialty: (specialty: string) => void;
  setWorkZone: (zone: string) => void;
  setPhotos: (photos: OnboardingPhoto[]) => void;
  addPhoto: (photo: OnboardingPhoto) => void;
  removePhoto: (photoId: string) => void;
  updatePhotoStatus: (
    photoId: string,
    updates: Partial<OnboardingPhoto>
  ) => void;
  setPhotoUploading: (photoId: string, uploading: boolean) => void;
  setPhotoDeleting: (photoId: string, deleting: boolean) => void;
  setWorkDescription: (description: string) => void;
  setPersonalInfo: (info: Partial<OnboardingPersonalInfo>) => void;
  setProfessionalInfo: (info: Partial<OnboardingProfessionalInfo>) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  resetOnboarding: () => void;
}

const initialPersonalInfo: OnboardingPersonalInfo = {
  fullName: "",
  phone: "",
  locationProvince: "",
  locationCity: "",
};

const initialProfessionalInfo: OnboardingProfessionalInfo = {
  bio: "",
  skills: [],
  tradeName: "",
  yearsExperience: 0,
  hourlyRate: 0,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      // Initial state
      selectedSpecialty: null,
      selectedWorkZone: null,
      uploadedPhotos: [],
      uploadingPhotos: new Set<string>(),
      deletingPhotos: new Set<string>(),
      workDescription: "",
      personalInfo: initialPersonalInfo,
      professionalInfo: initialProfessionalInfo,
      currentStep: 1,
      completedSteps: new Set<number>(),

      // Actions
      setSpecialty: (specialty: string) =>
        set({ selectedSpecialty: specialty }),

      setWorkZone: (zone: string) => set({ selectedWorkZone: zone }),

      setPhotos: (photos: OnboardingPhoto[]) => set({ uploadedPhotos: photos }),

      addPhoto: (photo: OnboardingPhoto) =>
        set((state) => ({
          uploadedPhotos: [...state.uploadedPhotos, photo],
        })),

      removePhoto: (photoId: string) =>
        set((state) => ({
          uploadedPhotos: state.uploadedPhotos.filter(
            (photo) => photo.id !== photoId
          ),
          uploadingPhotos: new Set(
            [...state.uploadingPhotos].filter((id) => id !== photoId)
          ),
          deletingPhotos: new Set(
            [...state.deletingPhotos].filter((id) => id !== photoId)
          ),
        })),

      updatePhotoStatus: (photoId: string, updates: Partial<OnboardingPhoto>) =>
        set((state) => ({
          uploadedPhotos: state.uploadedPhotos.map((photo) =>
            photo.id === photoId ? { ...photo, ...updates } : photo
          ),
        })),

      setPhotoUploading: (photoId: string, uploading: boolean) =>
        set((state) => {
          const newUploadingPhotos = new Set(state.uploadingPhotos);
          if (uploading) {
            newUploadingPhotos.add(photoId);
          } else {
            newUploadingPhotos.delete(photoId);
          }
          return { uploadingPhotos: newUploadingPhotos };
        }),

      setPhotoDeleting: (photoId: string, deleting: boolean) =>
        set((state) => {
          const newDeletingPhotos = new Set(state.deletingPhotos);
          if (deleting) {
            newDeletingPhotos.add(photoId);
          } else {
            newDeletingPhotos.delete(photoId);
          }
          return { deletingPhotos: newDeletingPhotos };
        }),

      setWorkDescription: (description: string) =>
        set({ workDescription: description }),

      setPersonalInfo: (info: Partial<OnboardingPersonalInfo>) =>
        set((state) => ({
          personalInfo: { ...state.personalInfo, ...info },
        })),

      setProfessionalInfo: (info: Partial<OnboardingProfessionalInfo>) =>
        set((state) => ({
          professionalInfo: { ...state.professionalInfo, ...info },
        })),

      setCurrentStep: (step: number) => set({ currentStep: step }),

      markStepCompleted: (step: number) =>
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        })),

      resetOnboarding: () =>
        set({
          selectedSpecialty: null,
          selectedWorkZone: null,
          uploadedPhotos: [],
          uploadingPhotos: new Set<string>(),
          deletingPhotos: new Set<string>(),
          workDescription: "",
          personalInfo: initialPersonalInfo,
          professionalInfo: initialProfessionalInfo,
          currentStep: 1,
          completedSteps: new Set<number>(),
        }),
    }),
    {
      name: "onboarding-storage", // localStorage key
      // Only persist specific fields to avoid File objects in localStorage
      partialize: (state) => ({
        selectedSpecialty: state.selectedSpecialty,
        selectedWorkZone: state.selectedWorkZone,
        workDescription: state.workDescription,
        personalInfo: state.personalInfo,
        professionalInfo: state.professionalInfo,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps), // Convert Set to Array for storage
        // Note: uploadedPhotos with File objects cannot be persisted
      }),
      // Custom merge function to restore the Set from Array
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        completedSteps: new Set(persistedState?.completedSteps || []),
      }),
    }
  )
);

// Hook personalizado para usar el onboarding store
export const useOnboarding = () => {
  const store = useOnboardingStore();

  const canProceedFromSpecialty = () => {
    return !!(store.selectedSpecialty || store.selectedWorkZone);
  };

  const canProceedFromPhotos = () => {
    return (
      store.uploadedPhotos.length >= 2 &&
      store.workDescription.trim().length >= 50
    );
  };

  const canProceedFromPersonalInfo = () => {
    const { fullName, phone, locationProvince, locationCity } =
      store.personalInfo;
    return !!(fullName && phone && locationProvince && locationCity);
  };

  const canProceedFromProfessionalInfo = () => {
    const { bio, skills, tradeName, yearsExperience } = store.professionalInfo;
    return !!(bio && skills.length > 0 && tradeName && yearsExperience > 0);
  };

  return {
    ...store,
    canProceedFromSpecialty,
    canProceedFromPhotos,
    canProceedFromPersonalInfo,
    canProceedFromProfessionalInfo,
  };
};
