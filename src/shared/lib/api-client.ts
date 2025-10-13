import { container } from '@/src/core/di'

/**
 * @deprecated Use container.getHttpClient() or specific services instead
 * This is kept for backward compatibility during migration
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

/**
 * @deprecated Legacy API Client - Use DI Container services instead
 * Mantenido para compatibilidad durante la migración
 */
class ApiClient {
  private httpClient = container.getHttpClient()

  // Auth methods
  async getSession() {
    return this.httpClient.get('/auth/session')
  }

  async signInWithGoogle() {
    return this.httpClient.post('/auth/google')
  }

  async signOut() {
    return this.httpClient.post('/auth/signout')
  }

  // Professionals methods
  async discoverProfessionals() {
    return this.httpClient.get('/professionals?mode=discover')
  }

  async browseProfessionals() {
    return this.httpClient.get('/professionals?mode=browse')
  }

  async getProfessionalById(id: string) {
    return this.httpClient.get(`/professionals/${id}`)
  }

  async syncAvatar() {
    return this.httpClient.post('/sync-avatar')
  }

  async bulkSyncAvatars() {
    return this.httpClient.put('/sync-avatar')
  }

  async getMyProfiles() {
    return this.httpClient.get('/my-profiles')
  }

  async createProfessionalProfile(profileData: any) {
    return this.httpClient.post('/professionals', profileData)
  }

  async updateProfessionalProfile(id: string, profileData: any) {
    return this.httpClient.put(`/professionals/${id}`, profileData)
  }

  async deleteProfessionalProfile(id: string) {
    return this.httpClient.delete(`/professionals/${id}`)
  }

  async getProfessionalProfile(id: string) {
    return this.httpClient.get(`/professionals/${id}`)
  }

  // Portfolio methods
  async getPortfolio() {
    return this.httpClient.get('/user-profile/portfolio')
  }

  async createPortfolioItem(itemData: any) {
    return this.httpClient.post('/user-profile/portfolio', itemData)
  }

  // Reviews methods
  async getReviews(professionalId: string) {
    return this.httpClient.get(`/user-profile/reviews?professionalId=${professionalId}`)
  }

  async createReview(reviewData: any) {
    return this.httpClient.post('/user-profile/reviews', reviewData)
  }

  // Generic HTTP methods
  async get(endpoint: string) {
    return this.httpClient.get(endpoint)
  }

  async post(endpoint: string, data?: any) {
    return this.httpClient.post(endpoint, data)
  }

  async put(endpoint: string, data?: any) {
    return this.httpClient.put(endpoint, data)
  }

  async delete(endpoint: string) {
    return this.httpClient.delete(endpoint)
  }

  // User profiles methods
  async getUserProfile(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    return this.httpClient.get(`/profiles${params}`)
  }

  async createUserProfile(profileData: any) {
    return this.httpClient.post('/profiles', profileData)
  }

  async updateUserProfile(profileData: any) {
    return this.httpClient.put('/profiles', profileData)
  }

  // Onboarding methods
  async saveOnboardingData(onboardingData: any) {
    return this.httpClient.post('/onboarding', onboardingData)
  }

  // User type selection methods
  async setUserType(userType: string) {
    return this.httpClient.post('/profiles/user-type', { userType })
  }

  // Onboarding status methods
  async getOnboardingStatus() {
    return this.httpClient.get('/profiles/onboarding-status')
  }
}

export const apiClient = new ApiClient()
export { ApiError }
export type { ApiResponse }