import { container } from '@/src/core/di';
import type { ServiceRequest, ServiceRequestFormData, ServiceRequestFilters } from '../types';

export class ServiceRequestsService {
  private httpClient = container.getHttpClient();

  async getServiceRequests(filters?: ServiceRequestFilters) {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.location_city) params.set('city', filters.location_city);
    if (filters?.status) params.set('status', filters.status);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.httpClient.get<ServiceRequest[]>(`/service-requests${query}`);
  }

  async getMyServiceRequests() {
    return this.httpClient.get<ServiceRequest[]>('/service-requests/my-requests');
  }

  async getServiceRequestById(id: string) {
    return this.httpClient.get<ServiceRequest>(`/service-requests/${id}`);
  }

  async createServiceRequest(data: ServiceRequestFormData & { photos?: string[] }) {
    return this.httpClient.post<ServiceRequest>('/service-requests', data);
  }

  async updateServiceRequest(id: string, data: Partial<ServiceRequestFormData>) {
    return this.httpClient.put<ServiceRequest>(`/service-requests/${id}`, data);
  }

  async deleteServiceRequest(id: string) {
    return this.httpClient.delete(`/service-requests/${id}`);
  }

  async uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.httpClient.post<{ url: string }>('/service-requests/upload-photo', formData);
  }
}

export const serviceRequestsService = new ServiceRequestsService();
