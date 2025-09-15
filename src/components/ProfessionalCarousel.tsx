"use client";

import { useCallback } from "react";
import useEmblaCarousel from 'embla-carousel-react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Phone, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "@/lib/navigation";

interface Professional {
  id: string;
  profile_full_name: string;
  profile_avatar_url?: string;
  trade_name: string;
  years_experience: number;
  description?: string;
  profile_location_city?: string;
  profile_location_province?: string;
  profile_skills?: string[];
  has_contact_info: boolean;
}

interface ProfessionalCarouselProps {
  categoryName: string;
  professionals: Professional[];
}

export function ProfessionalCarousel({ categoryName, professionals }: ProfessionalCarouselProps) {
  const navigate = useNavigate();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { slidesToScroll: 3 },
      '(min-width: 1280px)': { slidesToScroll: 4 },
    }
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold">
          {categoryName}
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground">
            {professionals.length} disponible{professionals.length !== 1 ? 's' : ''}
          </span>
          <div className="hidden sm:flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollPrev}
              className="h-7 w-7 p-0 rounded-full border-2"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollNext}
              className="h-7 w-7 p-0 rounded-full border-2"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 sm:gap-4">
          {professionals.map((professional) => (
            <div 
              key={professional.id} 
              className="flex-shrink-0 w-[260px] sm:w-[280px]"
            >
              <Card 
                className="hover:shadow-elevated transition-all duration-200 cursor-pointer group border shadow-sm h-full"
                onClick={() => navigate(`/profesional?id=${professional.id}`)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="space-y-3">
                    {/* Profile Header */}
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-10 h-10 border border-primary/20">
                        <AvatarImage src={professional.profile_avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {professional.profile_full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {professional.profile_full_name}
                        </h3>
                        <p className="text-xs text-primary font-medium">
                          {professional.trade_name}
                        </p>
                      </div>
                    </div>
                    
                    {/* Experience */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{professional.years_experience} años de experiencia</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {professional.description || 'Profesional especializado en su área'}
                    </p>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {professional.profile_location_city && professional.profile_location_province
                          ? `${professional.profile_location_city}, ${professional.profile_location_province}`
                          : "Ubicación no especificada"
                        }
                      </span>
                    </div>
                    
                    {/* Skills and Contact */}
                    <div className="space-y-2">
                      {professional.profile_skills && professional.profile_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {professional.profile_skills.slice(0, 2).map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-1.5 py-0.5"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {professional.profile_skills.length > 2 && (
                            <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                              +{professional.profile_skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {professional.has_contact_info && (
                        <Badge variant="outline" className="text-xs w-fit">
                          <Phone className="h-3 w-3 mr-1" />
                          Contacto disponible
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}