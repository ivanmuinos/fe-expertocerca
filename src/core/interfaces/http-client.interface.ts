/**
 * HTTP Client Interface - Abstracción para clientes HTTP
 * Permite cambiar la implementación sin afectar el código que lo usa
 */
export interface IHttpClient {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>
  post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>
  put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T>
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>
}

export interface RequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string>
}

export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'HttpError'
  }
}
