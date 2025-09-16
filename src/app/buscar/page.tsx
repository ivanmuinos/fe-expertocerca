"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Search, Clock, MapPin, Phone, Wrench, Hammer, Paintbrush, Zap, Droplets, Scissors, Car, Home } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { useSecureProfessionals } from "@/src/features/professionals";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from '@/src/features/auth'
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import ProfessionalMiniDetail from "@/src/shared/components/ProfessionalMiniDetail";

interface Professional {
  id: string;
  trade_name: string;
  description?: string;
  years_experience?: number;
  user_id: string;
  profile_full_name: string;
  profile_location_city?: string;
  profile_location_province?: string;
  profile_skills?: string[];
  profile_avatar_url?: string;
  has_contact_info?: boolean;
  whatsapp_phone?: string;
  hourly_rate?: number;
}

export default function BuscarPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const { loading: professionalsLoading, discoverProfessionals, browseProfessionals } = useSecureProfessionals();
    const { user, loading: authLoading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Popular services for autocomplete
  const popularServices = [
    { name: 'Electricista', icon: Zap },
    { name: 'Plomero', icon: Droplets },
    { name: 'Pintor', icon: Paintbrush },
    { name: 'Carpintero', icon: Hammer },
    { name: 'Técnico en aires', icon: Wrench },
    { name: 'Peluquero', icon: Scissors },
    { name: 'Mecánico', icon: Car },
    { name: 'Limpieza', icon: Home },
  ];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedZone('all');
  };

  // Initialize search params client-side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setSearchParams(params);
    }
  }, []);

  // Obtener parámetros de la URL
  useEffect(() => {
    if (!searchParams) return;
    const servicio = searchParams.get('servicio') || '';
    const zona = searchParams.get('zona') || '';
    setSearchTerm(servicio);
    setSelectedZone(zona);
  }, [searchParams]);

  useEffect(() => {
    loadProfessionals();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [professionals, searchTerm, selectedZone]);

  const loadProfessionals = async () => {
    const { data, error } = user ? await browseProfessionals() : await discoverProfessionals();

    if (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los profesionales",
        variant: "destructive",
      });
      return;
    }

    setProfessionals((data || []) as Professional[]);
  };

  const applyFilters = () => {
    let filtered = professionals;

    // Filtro por término de búsqueda (servicio)
    if (searchTerm) {
      filtered = filtered.filter(prof =>
        prof.trade_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.profile_full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prof.profile_skills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtro por zona
    if (selectedZone && selectedZone !== 'all') {
      filtered = filtered.filter(prof =>
        prof.profile_location_city?.toLowerCase().includes(selectedZone.toLowerCase()) ||
        prof.profile_location_province?.toLowerCase().includes(selectedZone.toLowerCase())
      );
    }

    setFilteredProfessionals(filtered);
  };

  const handleProfessionalClick = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  // Handle professional selection
  const handleProfessionalSelect = (professional: Professional) => {
    setSelectedProfessional(professional);
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <SharedHeader
        showBackButton={true}
        showSearch={true}
        searchProps={{
          searchTerm,
          setSearchTerm,
          selectedZone,
          setSelectedZone,
          popularServices,
          clearFilters
        }}
      />

      {/* Layout móvil primero */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Lista de profesionales - Full width en mobile */}
        <div className="flex-1 lg:w-3/5 overflow-y-auto scrollbar-hide bg-background">
          <div className="p-3 lg:p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                {filteredProfessionals.length} profesionales
              </h2>
              {searchTerm && (
                <Badge variant="secondary">
                  Servicio: {searchTerm}
                </Badge>
              )}
            </div>

            {professionalsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        <div className="w-16 h-16 bg-muted rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                          <div className="h-3 bg-muted rounded w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProfessionals.length > 0 ? (
              <div className="space-y-2 lg:space-y-3">
                {filteredProfessionals.map((professional) => (
                  <Card
                    key={professional.id}
                    id={`professional-${professional.id}`}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedProfessional?.id === professional.id
                        ? 'ring-2 ring-primary shadow-md'
                        : ''
                    }`}
                    onClick={() => handleProfessionalClick(professional)}
                  >
                  <CardContent className="p-3 lg:p-4">
                      <div className="flex space-x-4">
                        <Avatar className="w-16 h-16 border-2 border-primary/10">
                          <AvatarImage src={professional.profile_avatar_url} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {professional.profile_full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0 space-y-2">
                          <div>
                            <h3 className="font-semibold text-foreground line-clamp-1">
                              {professional.profile_full_name}
                            </h3>
                            <p className="text-sm text-primary font-medium">
                              {professional.trade_name}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{professional.years_experience || 0} años de experiencia</span>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {professional.description}
                          </p>

                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">
                              {professional.profile_location_city && professional.profile_location_province
                                ? `${professional.profile_location_city}, ${professional.profile_location_province}`
                                : "Ubicación no especificada"
                              }
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            {professional.hourly_rate && (
                              <p className="font-semibold text-primary">
                                ${professional.hourly_rate.toLocaleString()}/hora
                              </p>
                            )}

                            {professional.has_contact_info && (
                              <Badge variant="outline" className="text-xs">
                                <Phone className="h-3 w-3 mr-1" />
                                Contacto
                              </Badge>
                            )}
                          </div>

                          {professional.profile_skills && professional.profile_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {professional.profile_skills.slice(0, 3).map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs px-2 py-0.5"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">No se encontraron profesionales</h3>
                  <p className="text-muted-foreground">
                    Intenta modificar tus filtros de búsqueda o explora otras zonas.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedZone('');
                  }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Panel de detalle - Hidden en mobile, visible en desktop */}
        <div className="hidden lg:block lg:w-2/5 relative bg-muted/30 border-l">
          <ProfessionalMiniDetail professional={selectedProfessional} />
        </div>

        {/* Modal de detalle para mobile */}
        {selectedProfessional && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-end">
            <div className="bg-background rounded-t-2xl max-h-[80vh] w-full overflow-hidden">
              <div className="sticky top-0 bg-background border-b p-3 flex justify-between items-center">
                <h3 className="font-semibold">Información del profesional</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProfessional(null)}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </div>
              <div className="overflow-y-auto scrollbar-hide">
                <ProfessionalMiniDetail professional={selectedProfessional} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}