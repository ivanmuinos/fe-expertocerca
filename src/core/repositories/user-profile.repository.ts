import { IHttpClient } from '@/src/core/interfaces'

export interface UserProfile {
  id: string
  user_id: string
  full_name?: string
  avatar_url?: string
  user_type?: string
  onboarding_completed?: boolean
  [key: string]: any
}

/**
 * User Profile Repository
 * Maneja operaciones relacionadas con el perfil del usuario
 */
export class UserProfileRepository {
  constructor(private httpClient: IHttpClient) {}

  async findByUserId(userId?: string): Promise<UserProfile | null> {
    try {
      const params = userId ? `?userId=${userId}` : ''
      return await this.httpClient.get<UserProfile>(`/profiles${params}`)
    } catch {
      return null
    }
  }

  async create(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.httpClient.post<UserProfile>('/profiles', data)
  }

  async update(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.httpClient.put<UserProfile>('/profiles', data)
  }

  async setUserType(userType: string): Promise<void> {
    await this.httpClient.post('/profiles/user-type', { userType })
  }

  async getOnboardingStatus(): Promise<any> {
    return this.httpClient.get('/profiles/onboarding-status')
  }
}
