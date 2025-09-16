import { apiClient } from '@/src/shared/lib/api-client'
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
  static async getMyProfiles(): Promise<MyProfessionalProfile[]> {
    return apiClient.getMyProfiles()
  }

  /**
   * Get a single professional profile by ID for the current user
   */
  static async getMyProfile(profileId: string): Promise<MyProfessionalProfile | null> {
    return apiClient.getProfile(profileId)
  }

  /**
   * Create a new professional profile
   */
  static async createProfile(data: ProfessionalFormData): Promise<ProfessionalProfile> {
    return apiClient.createProfile(data)
  }

  /**
   * Update a professional profile
   */
  static async updateProfile(profileId: string, data: Partial<ProfessionalFormData>): Promise<ProfessionalProfile> {
    return apiClient.updateProfile(profileId, data)
  }

  /**
   * Delete a professional profile
   */
  static async deleteProfile(profileId: string): Promise<void> {
    return apiClient.deleteProfile(profileId)
  }

  /**
   * Discover professionals - Safe for public access (no phone numbers exposed)
   */
  static async discoverProfessionals(): Promise<SecureProfessional[]> {
    return apiClient.discoverProfessionals()
  }

  /**
   * Browse professionals - For authenticated users (includes contact info)
   */
  static async browseProfessionals(): Promise<AuthenticatedProfessional[]> {
    return apiClient.browseProfessionals()
  }
}