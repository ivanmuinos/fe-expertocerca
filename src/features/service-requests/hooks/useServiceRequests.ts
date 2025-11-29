import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceRequestsService } from '../services/service-requests.service';
import type { ServiceRequestFormData, ServiceRequestFilters } from '../types';
import { useToast } from '@/src/shared/hooks/use-toast';

export const queryKeys = {
  serviceRequests: {
    all: ['service-requests'] as const,
    list: (filters?: ServiceRequestFilters) => [...queryKeys.serviceRequests.all, 'list', filters] as const,
    myRequests: () => [...queryKeys.serviceRequests.all, 'my-requests'] as const,
    detail: (id: string) => [...queryKeys.serviceRequests.all, 'detail', id] as const,
  },
};

interface UseServiceRequestsOptions extends ServiceRequestFilters {
  enabled?: boolean;
}

export function useServiceRequests(options?: UseServiceRequestsOptions) {
  const { enabled, ...filters } = options || {};

  return useQuery({
    queryKey: queryKeys.serviceRequests.list(filters),
    queryFn: () => serviceRequestsService.getServiceRequests(filters),
    enabled,
  });
}

export function useMyServiceRequests() {
  return useQuery({
    queryKey: queryKeys.serviceRequests.myRequests(),
    queryFn: () => serviceRequestsService.getMyServiceRequests(),
  });
}

export function useServiceRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.serviceRequests.detail(id),
    queryFn: () => serviceRequestsService.getServiceRequestById(id),
    enabled: !!id,
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: ServiceRequestFormData) => 
      serviceRequestsService.createServiceRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
      toast({
        title: 'Solicitud publicada',
        description: 'Tu solicitud ha sido publicada exitosamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo publicar la solicitud',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateServiceRequest(id: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Partial<ServiceRequestFormData>) =>
      serviceRequestsService.updateServiceRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
      toast({
        title: 'Solicitud actualizada',
        description: 'Los cambios se guardaron correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar la solicitud',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteServiceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => serviceRequestsService.deleteServiceRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.serviceRequests.all });
      toast({
        title: 'Solicitud eliminada',
        description: 'La solicitud ha sido eliminada',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la solicitud',
        variant: 'destructive',
      });
    },
  });
}
