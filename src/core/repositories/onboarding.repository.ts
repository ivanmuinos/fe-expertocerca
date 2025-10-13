import { IHttpClient } from '@/src/core/interfaces'

export interface OnboardingData {
  user_type?: string
  specialty?: string
  description?: string
  phone?: string
  zone?: string
  [key: string]: any
}

/**
 * Onboarding Repository
 * Maneja el proceso de onboarding
 */
export class OnboardingRepository {
  constructor(private httpClient: IHttpClient) {}

  async save(data: OnboardingData): Promise<void> {
    await this.httpClient.post('/onboarding', data)
  }
}
