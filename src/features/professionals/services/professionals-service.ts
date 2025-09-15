import { supabase } from '@/src/config/supabase'
import type {
  ProfessionalProfile,
  MyProfessionalProfile,
  SecureProfessional,
  AuthenticatedProfessional,
  ProfessionalFormData
} from '../types'

export class ProfessionalsService {
  /**
   * Get all professional profiles for the current user
   */
  static async getMyProfiles(userId: string): Promise<MyProfessionalProfile[]> {
    // Get professional profiles for current user
    const { data: profiles, error: profilesError } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (profilesError) {
      throw new Error(`Error loading profiles: ${profilesError.message}`)
    }

    // Get profile data separately for the current user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, location_city, location_province, skills, avatar_url')
      .eq('user_id', userId)
      .single()

    if (profileError || !profileData) {
      throw new Error(`Error loading profile data: ${profileError?.message}`)
    }

    // Map the data to include profile information at the top level
    return (profiles || []).map(prof => ({
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
    }))
  }

  /**
   * Get a single professional profile by ID for the current user
   */
  static async getMyProfile(userId: string, profileId: string): Promise<MyProfessionalProfile | null> {
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
      .eq('user_id', userId)
      .single()

    if (error) {
      throw new Error(`Error getting profile: ${error.message}`)
    }

    // Get profile data separately for the current user
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name, location_city, location_province, skills, avatar_url')
      .eq('user_id', userId)
      .single()

    if (profileError || !profileData) {
      throw new Error(`Error loading profile data: ${profileError?.message}`)
    }

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
    }
  }

  /**
   * Create a new professional profile
   */
  static async createProfile(userId: string, data: ProfessionalFormData): Promise<ProfessionalProfile> {
    const { data: profile, error } = await supabase
      .from('professional_profiles')
      .insert({
        ...data,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating profile: ${error.message}`)
    }

    return profile
  }

  /**
   * Update a professional profile
   */
  static async updateProfile(userId: string, profileId: string, data: Partial<ProfessionalFormData>): Promise<ProfessionalProfile> {
    const { data: profile, error } = await supabase
      .from('professional_profiles')
      .update(data)
      .eq('id', profileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Error updating profile: ${error.message}`)
    }

    return profile
  }

  /**
   * Delete a professional profile
   */
  static async deleteProfile(userId: string, profileId: string): Promise<void> {
    const { error } = await supabase
      .from('professional_profiles')
      .delete()
      .eq('id', profileId)
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Error deleting profile: ${error.message}`)
    }
  }

  /**
   * Discover professionals - Safe for public access (no phone numbers exposed)
   */
  static async discoverProfessionals(): Promise<SecureProfessional[]> {
    const { data, error } = await supabase.rpc('discover_professionals')

    if (error) {
      throw new Error(`Error discovering professionals: ${error.message}`)
    }

    return data || []
  }

  /**
   * Browse professionals - For authenticated users (includes contact info)
   */
  static async browseProfessionals(): Promise<AuthenticatedProfessional[]> {
    const { data, error } = await supabase.rpc('browse_professionals')

    if (error) {
      throw new Error(`Error browsing professionals: ${error.message}`)
    }

    return data || []
  }
}