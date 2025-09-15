import { useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';

interface SecureProfessional {
  id: string;
  trade_name: string;
  description: string;
  years_experience: number;
  user_id: string;
  profile_full_name: string;
  profile_location_city: string;
  profile_location_province: string;
  profile_skills: string[];
  profile_avatar_url?: string;
  has_contact_info?: boolean;
}

interface AuthenticatedProfessional extends SecureProfessional {
  whatsapp_phone?: string;
}

export function useSecureProfessionals() {
  const [loading, setLoading] = useState(false);

  /**
   * Discover professionals - Safe for public access (no phone numbers exposed)
   */
  const discoverProfessionals = async (): Promise<{ data: SecureProfessional[] | null; error: any | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('discover_professionals');
      
      if (error) {
        console.error('Error discovering professionals:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in discoverProfessionals:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Browse professionals - For authenticated users (includes contact info)
   */
  const browseProfessionals = async (): Promise<{ data: AuthenticatedProfessional[] | null; error: any | null }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('browse_professionals');
      
      if (error) {
        console.error('Error browsing professionals:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (error) {
      console.error('Error in browseProfessionals:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    discoverProfessionals,
    browseProfessionals,
  };
}