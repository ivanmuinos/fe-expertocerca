import { container } from '@/src/core/di'
import type {
  ProfessionalProfile,
  MyProfessionalProfile,
  SecureProfessional,
  AuthenticatedProfessional,
  ProfessionalFormData
} from '../types'

/**
 * Professionals Service - Feature Layer
 * Usa el servicio del core a través del DI Container
 * Cumple con Dependency Inversion Principle (DIP)
 */
export class ProfessionalsService {
  private static getCoreService() {
    return container.getProfessionalsService()
  }

  /**
   * Get all professional profiles for the current user
   */
  static async getMyProfiles(): Promise<MyProfessionalProfile[]> {
    return this.getCoreService().getMyProfiles() as Promise<MyProfessionalProfile[]>
  }

  /**
   * Get a single professional profile by ID for the current user
   */
  static async getMyProfile(profileId: string): Promise<MyProfessionalProfile | null> {
    return this.getCoreService().getMyProfile(profileId) as Promise<MyProfessionalProfile | null>
  }

  /**
   * Create a new professional profile
   */
  static async createProfile(data: ProfessionalFormData): Promise<ProfessionalProfile> {
    return this.getCoreService().createProfile(data)
  }

  /**
   * Update a professional profile
   */
  static async updateProfile(profileId: string, data: Partial<ProfessionalFormData>): Promise<ProfessionalProfile> {
    return this.getCoreService().updateProfile(profileId, data)
  }

  /**
   * Delete a professional profile
   */
  static async deleteProfile(profileId: string): Promise<void> {
    return this.getCoreService().deleteProfile(profileId)
  }

  /**
   * Discover professionals - Safe for public access (no phone numbers exposed)
   */
  static async discoverProfessionals(): Promise<SecureProfessional[]> {
    return this.getCoreService().discoverProfessionals() as Promise<SecureProfessional[]>
  }

  /**
   * Browse professionals - For authenticated users (includes contact info)
   */
  static async browseProfessionals(): Promise<AuthenticatedProfessional[]> {
    return this.getCoreService().browseProfessionals() as Promise<AuthenticatedProfessional[]>
  }
}