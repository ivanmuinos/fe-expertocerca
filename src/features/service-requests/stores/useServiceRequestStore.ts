import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ServiceRequestState {
  // Step 1: Problem
  category: string;
  title: string;
  description: string;
  
  // Step 2: Photos
  photos: File[];
  
  // Step 3: Contact & Location
  location_city: string;
  location_province: string;
  contact_phone: string;
  contact_email: string;
  zone: string;

  // Actions
  setField: (field: keyof Omit<ServiceRequestState, 'photos' | 'setField' | 'setPhotos' | 'reset'>, value: string) => void;
  setPhotos: (photos: File[]) => void;
  reset: () => void;
}

export const useServiceRequestStore = create<ServiceRequestState>((set) => ({
  category: '',
  title: '',
  description: '',
  photos: [],
  location_city: '',
  location_province: '',
  contact_phone: '',
  contact_email: '',
  zone: '',

  setField: (field, value) => set((state) => ({ ...state, [field]: value })),
  setPhotos: (photos) => set({ photos }),
  reset: () => set({
    category: '',
    title: '',
    description: '',
    photos: [],
    location_city: '',
    location_province: '',
    contact_phone: '',
    contact_email: '',
    zone: '',
  }),
}));
