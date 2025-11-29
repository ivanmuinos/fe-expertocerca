"use client";

import { useServiceRequests } from '../hooks/useServiceRequests';
import { ServiceRequestCard } from './ServiceRequestCard';
import { Button } from '@/src/shared/components/ui/button';
import { Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { Skeleton } from '@/src/shared/components/ui/skeleton';

interface ServiceRequestsSectionProps {
  category?: string;
  limit?: number;
  showHeader?: boolean;
}

export function ServiceRequestsSection({ 
  category, 
  limit = 6,
  showHeader = true 
}: ServiceRequestsSectionProps) {
  const navigate = useNavigate();
  const { data: requests = [], isLoading } = useServiceRequests(
    category ? { category, status: 'open' } : { status: 'open' }
  );

  const displayedRequests = limit ? requests.slice(0, limit) : requests;

  if (isLoading) {
    return (
      <section className="space-y-4">
        {showHeader && (
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </section>
    );
  }

  if (displayedRequests.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              {category ? `Solicitudes de ${category}` : 'Solicitudes Recientes'}
            </h2>
            <p className="text-muted-foreground">
              Usuarios que necesitan ayuda profesional
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/requests')}
          >
            Ver todas
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedRequests.map((request) => (
          <ServiceRequestCard 
            key={request.id} 
            request={request}
            showActions
          />
        ))}
      </div>

      {requests.length > limit && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={() => navigate('/requests')}
          >
            Ver más solicitudes
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </section>
  );
}
