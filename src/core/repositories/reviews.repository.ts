import { IHttpClient } from '@/src/core/interfaces'

export interface Review {
  id: string
  professional_id: string
  reviewer_id: string
  rating: number
  comment?: string
  created_at: string
  [key: string]: any
}

/**
 * Reviews Repository
 * Maneja operaciones de reseñas
 */
export class ReviewsRepository {
  constructor(private httpClient: IHttpClient) {}

  async findByProfessionalId(professionalId: string): Promise<Review[]> {
    try {
      return await this.httpClient.get<Review[]>(`/user-profile/reviews?professionalId=${professionalId}`)
    } catch {
      return []
    }
  }

  async create(data: Partial<Review>): Promise<Review> {
    return this.httpClient.post<Review>('/user-profile/reviews', data)
  }
}
