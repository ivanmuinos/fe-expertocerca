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

class ApiClient {
  private baseUrl: string

  constructor() {
    // Use relative URLs when running in browser, absolute URLs for SSR
    this.baseUrl = typeof window !== 'undefined' ? '' : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'same-origin',
      ...options,
    })

    const data: ApiResponse<T> = await response.json()

    if (!response.ok) {
      throw new ApiError(
        data.error || 'API request failed',
        response.status,
        data
      )
    }

    return data.data as T
  }

  // Auth methods
  async getSession() {
    return this.request('/auth/session')
  }

  async signInWithGoogle() {
    return this.request('/auth/google', {
      method: 'POST',
    })
  }

  async signOut() {
    return this.request('/auth/signout', {
      method: 'POST',
    })
  }

  // Professionals methods
  async discoverProfessionals() {
    return this.request('/professionals?mode=discover')
  }

  async browseProfessionals() {
    return this.request('/professionals?mode=browse')
  }

  async getMyProfiles() {
    return this.request('/my-profiles')
  }

  async createProfile(profileData: any) {
    return this.request('/professionals', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }

  async updateProfile(id: string, profileData: any) {
    return this.request(`/professionals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async deleteProfile(id: string) {
    return this.request(`/professionals/${id}`, {
      method: 'DELETE',
    })
  }

  async getProfile(id: string) {
    return this.request(`/professionals/${id}`)
  }

  // Portfolio methods
  async getPortfolio() {
    return this.request('/user-profile/portfolio')
  }

  async createPortfolioItem(itemData: any) {
    return this.request('/user-profile/portfolio', {
      method: 'POST',
      body: JSON.stringify(itemData),
    })
  }

  // Reviews methods
  async getReviews(professionalId: string) {
    return this.request(`/user-profile/reviews?professionalId=${professionalId}`)
  }

  async createReview(reviewData: any) {
    return this.request('/user-profile/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    })
  }

  // Generic HTTP methods
  async get(endpoint: string) {
    return this.request(endpoint)
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }

  // Profiles methods
  async getProfile(userId?: string) {
    const params = userId ? `?userId=${userId}` : ''
    return this.request(`/profiles${params}`)
  }

  async createProfile(profileData: any) {
    return this.request('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    })
  }

  async updateProfile(profileData: any) {
    return this.request('/profiles', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  // Onboarding methods
  async saveOnboardingData(onboardingData: any) {
    return this.request('/onboarding', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    })
  }

  // User type selection methods
  async setUserType(userType: string) {
    return this.request('/profiles/user-type', {
      method: 'POST',
      body: JSON.stringify({ userType }),
    })
  }

  // Onboarding status methods
  async getOnboardingStatus() {
    return this.request('/profiles/onboarding-status')
  }
}

export const apiClient = new ApiClient()
export { ApiError }
export type { ApiResponse }