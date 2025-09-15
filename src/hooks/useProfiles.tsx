import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      // Save to profiles table (only basic user info)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          {
            user_id: userId,
            full_name: data.fullName,
            first_name: data.fullName.split(' ')[0],
            last_name: data.fullName.split(' ').slice(1).join(' '),
            phone: data.phone,
            whatsapp_phone: data.whatsappPhone,
            location_province: data.locationProvince,
            location_city: data.locationCity,
            user_type: 'professional', // Mark as professional
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );

      if (profileError) throw profileError;

      // Create professional profile (required fields: specialty, trade_name)
      if (data.specialty && data.tradeName) {
        const { data: professionalProfile, error: professionalError } = await supabase
          .from('professional_profiles')
          .upsert({
            user_id: userId,
            specialty: data.specialty, // Required field
            trade_name: data.tradeName, // Required field
            description: data.bio, // Professional description
            skills: data.skills, // Moved from profiles table
            years_experience: data.yearsExperience || 0,
            hourly_rate: data.hourlyRate,
            whatsapp_phone: data.whatsappPhone,
            is_active: true, // Default to active
            accepts_new_clients: true, // Default to accepting clients
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' })
          .select()
          .single();

        if (professionalError) throw professionalError;

        // If work zone is specified and it's a valid UUID, save it to professional_work_zones
        // For now, skip work zone saving since we have zone names instead of UUIDs
        if (data.workZone && professionalProfile && isValidUUID(data.workZone)) {
          const { error: workZoneError } = await supabase
            .from('professional_work_zones')
            .upsert({
              professional_profile_id: professionalProfile.id,
              work_zone_id: data.workZone
            });

          if (workZoneError) throw workZoneError;
        } else if (data.workZone) {
          console.log('Skipping work zone save - zone name provided instead of UUID:', data.workZone);
        }
      }

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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      return { data: null, error };
    }
  };

  const getProfessionalProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data, error: null };
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