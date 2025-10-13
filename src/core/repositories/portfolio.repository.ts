import { IHttpClient } from '@/src/core/interfaces'

export interface PortfolioItem {
  id: string
  professional_id: string
  title: string
  description?: string
  image_url?: string
  [key: string]: any
}

/**
 * Portfolio Repository
 * Maneja operaciones del portafolio de profesionales
 */
export class PortfolioRepository {
  constructor(private httpClient: IHttpClient) {}

  async findAll(): Promise<PortfolioItem[]> {
    try {
      return await this.httpClient.get<PortfolioItem[]>('/user-profile/portfolio')
    } catch {
      return []
    }
  }

  async create(data: Partial<PortfolioItem>): Promise<PortfolioItem> {
    return this.httpClient.post<PortfolioItem>('/user-profile/portfolio', data)
  }
}
