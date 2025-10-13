import { ProfessionalsRepository, ProfessionalProfile, SecureProfessional } from '@/src/core/repositories'

/**
 * Professionals Service
 * Contiene la lógica de negocio para profesionales
 * Cumple con Single Responsibility Principle (SRP)
 */
export class ProfessionalsService {
  constructor(private repository: ProfessionalsRepository) {}

  async getMyProfiles(): Promise<ProfessionalProfile[]> {
    return this.repository.findMyProfiles()
  }

  async getMyProfile(profileId: string): Promise<ProfessionalProfile | null> {
    return this.repository.findById(profileId)
  }

  async createProfile(data: Partial<ProfessionalProfile>): Promise<ProfessionalProfile> {
    // Aquí podrías agregar validaciones de negocio
    return this.repository.create(data)
  }

  async updateProfile(profileId: string, data: Partial<ProfessionalProfile>): Promise<ProfessionalProfile> {
    return this.repository.update(profileId, data)
  }

  async deleteProfile(profileId: string): Promise<void> {
    return this.repository.delete(profileId)
  }

  async discoverProfessionals(): Promise<SecureProfessional[]> {
    return this.repository.discover()
  }

  async browseProfessionals(): Promise<ProfessionalProfile[]> {
    return this.repository.findAll()
  }
}
