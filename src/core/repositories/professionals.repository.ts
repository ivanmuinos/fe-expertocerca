import { IRepository, IQueryRepository, IHttpClient } from '@/src/core/interfaces'

export interface ProfessionalProfile {
  id: string
  user_id: string
  specialty: string
  description?: string
  phone?: string
  zone?: string
  [key: string]: any
}

export interface SecureProfessional extends Omit<ProfessionalProfile, 'phone'> {}

export interface ProfessionalFilters {
  specialty?: string
  zone?: string
  search?: string
}

/**
 * Professionals Repository
 * Maneja todas las operaciones relacionadas con perfiles profesionales
 * Cumple con Single Responsibility Principle (SRP)
 */
export class ProfessionalsRepository implements IRepository<ProfessionalProfile> {
  constructor(private httpClient: IHttpClient) {}

  async findById(id: string): Promise<ProfessionalProfile | null> {
    try {
      return await this.httpClient.get<ProfessionalProfile>(`/professionals/${id}`)
    } catch {
      return null
    }
  }

  async findAll(): Promise<ProfessionalProfile[]> {
    try {
      return await this.httpClient.get<ProfessionalProfile[]>('/professionals?mode=browse')
    } catch {
      return []
    }
  }

  async create(data: Partial<ProfessionalProfile>): Promise<ProfessionalProfile> {
    return this.httpClient.post<ProfessionalProfile>('/professionals', data)
  }

  async update(id: string, data: Partial<ProfessionalProfile>): Promise<ProfessionalProfile> {
    return this.httpClient.put<ProfessionalProfile>(`/professionals/${id}`, data)
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/professionals/${id}`)
  }

  // Métodos específicos del dominio
  async findMyProfiles(): Promise<ProfessionalProfile[]> {
    try {
      return await this.httpClient.get<ProfessionalProfile[]>('/my-profiles')
    } catch {
      return []
    }
  }

  async discover(): Promise<SecureProfessional[]> {
    try {
      return await this.httpClient.get<SecureProfessional[]>('/professionals?mode=discover')
    } catch {
      return []
    }
  }
}
