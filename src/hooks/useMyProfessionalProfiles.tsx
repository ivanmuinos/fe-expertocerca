import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();

  /**
   * Load all professional profiles for the current user
   */
  const loadMyProfiles = async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Get professional profiles for current user with profile data
      const { data, error } = await supabase
        .from('professional_profiles')
        .select(`
          id,
          trade_name,
          description,
          years_experience,
          hourly_rate,
          whatsapp_phone,
          work_phone,
          user_id,
          created_at,
          updated_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading my profiles:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus publicaciones",
          variant: "destructive",
        });
        return;
      }

      // Get profile data separately for the current user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, location_city, location_province, skills, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error loading profile data:', profileError);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del perfil",
          variant: "destructive",
        });
        return;
      }

      // Map the data to include profile information at the top level
      const mappedProfiles = (data || []).map(prof => ({
        id: prof.id,
        trade_name: prof.trade_name,
        description: prof.description,
        years_experience: prof.years_experience,
        hourly_rate: prof.hourly_rate,
        whatsapp_phone: prof.whatsapp_phone,
        work_phone: prof.work_phone,
        user_id: prof.user_id,
        profile_full_name: profileData.full_name,
        profile_location_city: profileData.location_city,
        profile_location_province: profileData.location_province,
        profile_skills: profileData.skills || [],
        profile_avatar_url: profileData.avatar_url,
        created_at: prof.created_at,
        updated_at: prof.updated_at,
      }));

      setMyProfiles(mappedProfiles);
    } catch (error) {
      console.error('Error in loadMyProfiles:', error);
      toast({
        title: "Error",
        description: "Error al cargar las publicaciones",
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
      const { error } = await supabase
        .from('professional_profiles')
        .delete()
        .eq('id', profileId)
        .eq('user_id', user.id); // Ensure user can only delete their own profiles

      if (error) {
        console.error('Error deleting profile:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la publicación",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProfessionalProfile:', error);
      toast({
        title: "Error",
        description: "Error al eliminar la publicación",
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
      const { data, error } = await supabase
        .from('professional_profiles')
        .select(`
          id,
          trade_name,
          description,
          years_experience,
          hourly_rate,
          whatsapp_phone,
          work_phone,
          user_id,
          created_at,
          updated_at
        `)
        .eq('id', profileId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error getting profile:', error);
        return null;
      }

      // Get profile data separately for the current user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, location_city, location_province, skills, avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData) {
        console.error('Error loading profile data:', profileError);
        return null;
      }

      // Map the data to include profile information at the top level
      return {
        id: data.id,
        trade_name: data.trade_name,
        description: data.description,
        years_experience: data.years_experience,
        hourly_rate: data.hourly_rate,
        whatsapp_phone: data.whatsapp_phone,
        work_phone: data.work_phone,
        user_id: data.user_id,
        profile_full_name: profileData.full_name,
        profile_location_city: profileData.location_city,
        profile_location_province: profileData.location_province,
        profile_skills: profileData.skills || [],
        profile_avatar_url: profileData.avatar_url,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
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