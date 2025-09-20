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
    try {
      return await apiClient.getMyProfiles()
    } catch (error) {
      return []
    }
  }

  /**
   * Get a single professional profile by ID for the current user
   */
  static async getMyProfile(profileId: string): Promise<MyProfessionalProfile | null> {
    try {
      return await apiClient.getProfessionalProfile(profileId)
    } catch (error) {
      return null
    }
  }

  /**
   * Create a new professional profile
   */
  static async createProfile(data: ProfessionalFormData): Promise<ProfessionalProfile> {
    try {
      return await apiClient.createProfessionalProfile(data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Update a professional profile
   */
  static async updateProfile(profileId: string, data: Partial<ProfessionalFormData>): Promise<ProfessionalProfile> {
    try {
      return await apiClient.updateProfessionalProfile(profileId, data)
    } catch (error) {
      throw error
    }
  }

  /**
   * Delete a professional profile
   */
  static async deleteProfile(profileId: string): Promise<void> {
    try {
      return await apiClient.deleteProfessionalProfile(profileId)
    } catch (error) {
      throw error
    }
  }

  /**
   * Discover professionals - Safe for public access (no phone numbers exposed)
   */
  static async discoverProfessionals(): Promise<SecureProfessional[]> {
    try {
      return await apiClient.discoverProfessionals()
    } catch (error) {
      return []
    }
  }

  /**
   * Browse professionals - For authenticated users (includes contact info)
   */
  static async browseProfessionals(): Promise<AuthenticatedProfessional[]> {
    try {
      return await apiClient.browseProfessionals()
    } catch (error) {
      return []
    }
  }
}