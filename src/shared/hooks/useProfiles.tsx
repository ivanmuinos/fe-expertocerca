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
  specialty?: string; // The main specialty/role (e.g., "Plomero", "Electricista")
  workZone?: string; // The work zone ID where they provide services
  // Professional service details (optional - users can offer services)
  tradeName?: string;
  yearsExperience?: number;
  hourlyRate?: number;
}

export const useProfiles = () => {
  const [loading, setLoading] = useState(false);

  const saveOnboardingData = async (data: OnboardingData, userId: string) => {
    setLoading(true);
    try {
      await apiClient.saveOnboardingData(data);
      return { success: true };
    } catch (error: any) {
      console.error('Error saving onboarding data:', error);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getProfile = async (userId: string) => {
    try {
      const data = await apiClient.getProfile(userId);
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  };

  const getProfessionalProfile = async (userId: string) => {
    try {
      const data = await apiClient.getMyProfiles();
      // Return the first profile for this user (API already filters by user)
      return { data: data[0] || null, error: null };
    } catch (error: any) {
      console.error('Error fetching professional profile:', error);
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