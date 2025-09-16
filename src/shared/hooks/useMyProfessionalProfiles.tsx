import { useState } from 'react';
import { apiClient } from '@/src/shared/lib/api-client';
import { useToast } from '@/src/shared/hooks/use-toast';
import { useAuthState } from '@/src/features/auth';

interface MyProfessionalProfile {
  id: string;
  trade_name: string;
  description: string;
  years_experience: number;
  hourly_rate?: number;
  whatsapp_phone?: string;
  work_phone?: string;
  user_id: string;
  profile_full_name: string;
  profile_location_city: string;
  profile_location_province: string;
  profile_skills: string[];
  profile_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useMyProfessionalProfiles() {
  const [loading, setLoading] = useState(false);
  const [myProfiles, setMyProfiles] = useState<MyProfessionalProfile[]>([]);
  const { toast } = useToast();
  const { user } = useAuthState();

  /**
   * Load all professional profiles for the current user
   */
  const loadMyProfiles = async (): Promise<void> => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await apiClient.get('/my-profiles');
      setMyProfiles(data || []);
    } catch (error) {
      console.error('Error in loadMyProfiles:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus publicaciones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a professional profile
   */
  const deleteProfessionalProfile = async (profileId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      await apiClient.delete(`/my-profiles?id=${profileId}`);
      return true;
    } catch (error) {
      console.error('Error in deleteProfessionalProfile:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Get a single professional profile by ID (for the current user)
   */
  const getMyProfile = async (profileId: string): Promise<MyProfessionalProfile | null> => {
    if (!user) return null;

    try {
      const data = await apiClient.get(`/my-profiles/${profileId}`);
      return data;
    } catch (error) {
      console.error('Error in getMyProfile:', error);
      return null;
    }
  };

  return {
    loading,
    myProfiles,
    loadMyProfiles,
    deleteProfessionalProfile,
    getMyProfile,
  };
}