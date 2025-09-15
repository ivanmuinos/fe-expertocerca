export interface ProfessionalProfile {
  id: string
  trade_name: string
  description: string
  years_experience: number
  hourly_rate?: number
  whatsapp_phone?: string
  work_phone?: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ProfileData {
  full_name: string
  location_city: string
  location_province: string
  skills: string[]
  avatar_url?: string
}

export interface MyProfessionalProfile extends ProfessionalProfile {
  profile_full_name: string
  profile_location_city: string
  profile_location_province: string
  profile_skills: string[]
  profile_avatar_url?: string
}

export interface SecureProfessional {
  id: string
  trade_name: string
  description: string
  years_experience: number
  user_id: string
  profile_full_name: string
  profile_location_city: string
  profile_location_province: string
  profile_skills: string[]
  profile_avatar_url?: string
  has_contact_info?: boolean
}

export interface AuthenticatedProfessional extends SecureProfessional {
  whatsapp_phone?: string
}

export interface ProfessionalFormData {
  trade_name: string
  description: string
  years_experience: number
  hourly_rate?: number
  whatsapp_phone?: string
  work_phone?: string
}

export interface ProfessionalFilters {
  location_city?: string
  location_province?: string
  skills?: string[]
  min_experience?: number
  max_hourly_rate?: number
}