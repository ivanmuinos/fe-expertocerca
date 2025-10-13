import { useState } from 'react';
import { apiClient } from '@/src/shared/lib/api-client';

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export interface OnboardingData {
  fullName: string;
  phone: string;
  whatsappPhone?: string;
  locationProvince: string;
  locationCity: string;
  bio: string;
  skills: string[];
  // Professional specialization and work area
  specialty?: string; // The actual specialty value (e.g., "Plomero", "Jardinero")
  specialtyCategory?: string; // The category for filtering (e.g., "Electricista", "Otros")
  workZone?: string; // The work zone ID where they provide services
  // Professional service details (optional - users can offer services)
  tradeName?: string;
  yearsExperience?: number;
  hourlyRate?: number;
  // Social media URLs
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  websiteUrl?: string;
}

export const useProfiles = () => {
  const [loading, setLoading] = useState(false);

  const saveOnboardingData = async (data: OnboardingData, userId: string) => {
    setLoading(true);
    try {
      const result = await apiClient.post('/onboarding/save', { data });
      return { success: true };
    } catch (error: any) {
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string) => {
    try {
      const data = await apiClient.get('/profiles/current');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const getProfessionalProfile = async (userId: string) => {
    try {
      const data = await apiClient.get('/profiles/professional');
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  return {
    loading,
    saveOnboardingData,
    getProfile,
    getProfessionalProfile
  };
};