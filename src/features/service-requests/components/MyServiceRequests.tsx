"use client";

import { useMyServiceRequests, useDeleteServiceRequest } from '../hooks/useServiceRequests';
import { ServiceRequestCard } from './ServiceRequestCard';
import { Button } from '@/src/shared/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { Skeleton } from '@/src/shared/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/src/shared/components/ui/alert-dialog';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Badge } from '@/src/shared/components/ui/badge';

export function MyServiceRequests() {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useMyServiceRequests();
  const deleteMutation = useDeleteServiceRequest();

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">No tienes solicitudes</h3>
            <p className="text-muted-foreground">
              Crea tu primera solicitud para encontrar profesionales
            </p>
        <Button onClick={() => navigate('/requests/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Solicitud
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mis Solicitudes</h2>
          <p className="text-muted-foreground">
            {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
          </p>
        </div>
        <Button onClick={() => navigate('/requests/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva
        </Button>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request.id} className="relative">
            <ServiceRequestCard request={request} />
            <div className="absolute top-4 right-4 flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar solicitud?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. La solicitud será eliminada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(request.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
