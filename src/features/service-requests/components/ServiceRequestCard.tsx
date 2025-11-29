"use client";

import { MapPin, Calendar, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/src/shared/components/ui/card';
import { Badge } from '@/src/shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/components/ui/avatar';
import { Button } from '@/src/shared/components/ui/button';
import type { ServiceRequest } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { useNavigate } from '@/src/shared/lib/navigation';

interface ServiceRequestCardProps {
  request: ServiceRequest;
  showActions?: boolean;
  onClick?: () => void;
}

export function ServiceRequestCard({ request, showActions = false, onClick }: ServiceRequestCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/requests/${request.id}`);
    }
  };

  const statusColors = {
    open: 'bg-green-500',
    closed: 'bg-gray-500',
    resolved: 'bg-blue-500',
  };

  const statusLabels = {
    open: 'Abierta',
    closed: 'Cerrada',
    resolved: 'Resuelta',
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.profile_avatar_url} />
              <AvatarFallback>
                {request.profile_full_name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base line-clamp-1">{request.title}</h3>
              <p className="text-sm text-muted-foreground">
                {request.profile_full_name || 'Usuario'}
              </p>
            </div>
          </div>
          <Badge className={statusColors[request.status]}>
            {statusLabels[request.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{request.category}</Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(request.created_at), { 
              addSuffix: true, 
              locale: es 
            })}
          </span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {request.description}
        </p>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{request.location_city}, {request.location_province}</span>
        </div>

        {request.photos && request.photos.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {request.photos.slice(0, 3).map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-md overflow-hidden">
                <Image
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 pt-2">
            {request.contact_phone && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={`tel:${request.contact_phone}`}>
                  <Phone className="w-4 h-4 mr-1" />
                  Llamar
                </a>
              </Button>
            )}
            {request.contact_email && (
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <a href={`mailto:${request.contact_email}`}>
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </a>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
