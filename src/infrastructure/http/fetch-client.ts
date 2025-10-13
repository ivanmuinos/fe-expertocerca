import { IHttpClient, RequestOptions, HttpError } from '@/src/core/interfaces'

interface ApiResponse<T = any> {
  data?: T
  error?: string
  success?: boolean
}

/**
 * Implementación concreta del HTTP Client usando Fetch API
 * Cumple con el principio de Inversión de Dependencias (DIP)
 */
export class FetchHttpClient implements IHttpClient {
  constructor(private baseUrl: string = '') {
    // Use relative URLs when running in browser, absolute URLs for SSR
    this.baseUrl = typeof window !== 'undefined' 
      ? '' 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
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
      throw new HttpError(
        data.error || 'API request failed',
        response.status,
        data
      )
    }

    return data.data as T
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers: options?.headers,
    })
  }

  async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    })
  }

  async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: options?.headers,
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers: options?.headers,
    })
  }
}
