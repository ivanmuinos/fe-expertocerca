import { FetchHttpClient } from '@/src/infrastructure/http'
import { IHttpClient, IAuthService } from '@/src/core/interfaces'
import {
  ProfessionalsRepository,
  UserProfileRepository,
  PortfolioRepository,
  ReviewsRepository,
  OnboardingRepository,
} from '@/src/core/repositories'
import {
  ProfessionalsService,
  UserProfileService,
  AuthService,
} from '@/src/core/services'
import { SupabaseAuthProvider } from '@/src/infrastructure/supabase/auth-provider'

/**
 * Dependency Injection Container
 * Cumple con el principio de Inversión de Dependencias (DIP)
 * Centraliza la creación e inyección de dependencias
 */
class DIContainer {
  private static instance: DIContainer
  private services: Map<string, any> = new Map()

  private constructor() {
    this.registerDependencies()
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  private registerDependencies() {
    // Infrastructure
    const httpClient = new FetchHttpClient()
    const authProvider = new SupabaseAuthProvider()
    
    this.services.set('IHttpClient', httpClient)
    this.services.set('IAuthProvider', authProvider)

    // Repositories
    const professionalsRepo = new ProfessionalsRepository(httpClient)
    const userProfileRepo = new UserProfileRepository(httpClient)
    const portfolioRepo = new PortfolioRepository(httpClient)
    const reviewsRepo = new ReviewsRepository(httpClient)
    const onboardingRepo = new OnboardingRepository(httpClient)

    this.services.set('ProfessionalsRepository', professionalsRepo)
    this.services.set('UserProfileRepository', userProfileRepo)
    this.services.set('PortfolioRepository', portfolioRepo)
    this.services.set('ReviewsRepository', reviewsRepo)
    this.services.set('OnboardingRepository', onboardingRepo)

    // Services
    const professionalsService = new ProfessionalsService(professionalsRepo)
    const userProfileService = new UserProfileService(userProfileRepo)
    const authService = new AuthService(httpClient, authProvider)

    this.services.set('ProfessionalsService', professionalsService)
    this.services.set('UserProfileService', userProfileService)
    this.services.set('AuthService', authService)
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName)
    if (!service) {
      throw new Error(`Service ${serviceName} not found in container`)
    }
    return service as T
  }

  // Helpers para acceso tipado
  getHttpClient(): IHttpClient {
    return this.get<IHttpClient>('IHttpClient')
  }

  getProfessionalsService(): ProfessionalsService {
    return this.get<ProfessionalsService>('ProfessionalsService')
  }

  getUserProfileService(): UserProfileService {
    return this.get<UserProfileService>('UserProfileService')
  }

  getAuthService(): IAuthService {
    return this.get<IAuthService>('AuthService')
  }

  getProfessionalsRepository(): ProfessionalsRepository {
    return this.get<ProfessionalsRepository>('ProfessionalsRepository')
  }

  getUserProfileRepository(): UserProfileRepository {
    return this.get<UserProfileRepository>('UserProfileRepository')
  }

  getPortfolioRepository(): PortfolioRepository {
    return this.get<PortfolioRepository>('PortfolioRepository')
  }

  getReviewsRepository(): ReviewsRepository {
    return this.get<ReviewsRepository>('ReviewsRepository')
  }

  getOnboardingRepository(): OnboardingRepository {
    return this.get<OnboardingRepository>('OnboardingRepository')
  }
}

export const container = DIContainer.getInstance()
