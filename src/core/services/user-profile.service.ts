import { UserProfileRepository, UserProfile } from '@/src/core/repositories'

/**
 * User Profile Service
 * Lógica de negocio para perfiles de usuario
 */
export class UserProfileService {
  constructor(private repository: UserProfileRepository) {}

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    return this.repository.findByUserId(userId)
  }

  async createProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.repository.create(data)
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.repository.update(data)
  }

  async setUserType(userType: string): Promise<void> {
    return this.repository.setUserType(userType)
  }

  async getOnboardingStatus(): Promise<any> {
    return this.repository.getOnboardingStatus()
  }
}
