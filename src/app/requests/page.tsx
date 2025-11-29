"use client";

import { useState } from 'react';
import { useServiceRequests } from '@/src/features/service-requests';
import { ServiceRequestCard } from '@/src/features/service-requests/components/ServiceRequestCard';
import { SharedHeader } from '@/src/shared/components/SharedHeader';
import { Button } from '@/src/shared/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { useNavigate } from '@/src/shared/lib/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/components/ui/select';
import { Skeleton } from '@/src/shared/components/ui/skeleton';

const serviceCategories = [
  'Todos',
  'Electricista',
  'Plomero',
  'Carpintero',
  'Pintor',
  'Albañil',
  'Jardinero',
  'Mecánico',
  'Técnico en aires',
  'Gasista',
  'Cerrajero',
  'Soldador',
  'Techista',
];

export default function SolicitudesPage() {
  const [category, setCategory] = useState<string>('');
  const navigate = useNavigate();
  
  const { data: requests = [], isLoading } = useServiceRequests(
    category && category !== 'Todos' ? { category, status: 'open' } : { status: 'open' }
  );

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-background">
      <div className="flex-none">
        <SharedHeader 
          variant="default" 
          title="Solicitudes de Servicios"
          showBackButton={false}
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              {serviceCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/requests/new')}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg bg-card">
                <div className="p-6 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar skeleton */}
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        {/* Title skeleton */}
                        <Skeleton className="h-5 w-3/4" />
                        {/* Name skeleton */}
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                    {/* Badge skeleton */}
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  {/* Category and date skeleton */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>

                  {/* Description skeleton */}
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>

                  {/* Location skeleton */}
                  <Skeleton className="h-4 w-48" />

                  {/* Photos skeleton */}
                  <div className="grid grid-cols-3 gap-2">
                    <Skeleton className="aspect-square rounded-md" />
                    <Skeleton className="aspect-square rounded-md" />
                    <Skeleton className="aspect-square rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((request) => (
              <ServiceRequestCard key={request.id} request={request} showActions />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No hay solicitudes</h3>
              <p className="text-muted-foreground">
                {category && category !== 'Todos'
                  ? `No se encontraron solicitudes de ${category}`
                  : 'Sé el primero en publicar una solicitud'}
              </p>
              <Button onClick={() => navigate('/requests/new')}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Solicitud
              </Button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
