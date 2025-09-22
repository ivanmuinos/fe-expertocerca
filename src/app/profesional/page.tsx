"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import {
  MapPin,
  Clock,
  DollarSign,
  Phone,
  Star,
  Zap,
  Wrench,
  Hammer,
  Paintbrush,
  Home as HomeIcon,
  Scissors,
  Car,
  Snowflake,
  Flame,
  Key,
  Zap as ZapIcon,
  Triangle,
} from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useSecureProfessionals } from "@/src/features/professionals";
import { ReviewsSection } from "@/src/shared/components/ReviewsSection";
import { PortfolioSection } from "@/src/shared/components/PortfolioSection";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { Footer } from "@/src/shared/components";

export default function ProfesionalPage() {
  const [id, setId] = useState<string>("");
  const [professional, setProfessional] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuthState();
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { browseProfessionals, discoverProfessionals } =
    useSecureProfessionals();

  // Search props for header
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

  // Get id from URL params or query string
  useEffect(() => {
    if (typeof window !== "undefined") {
      // First try route params (for /profesional/[id] routes)
      const pathParts = window.location.pathname.split("/");
      const routeId = pathParts[pathParts.length - 1];

      // Then try query params (for /profesional?id=xxx routes)
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get("id");

      const professionalId =
        routeId && routeId !== "profesional" ? routeId : queryId;

      if (professionalId) {
        setId(professionalId);
      }
    }
  }, []);

  const popularServices = [
    { name: "Electricista", icon: Zap },
    { name: "Plomero", icon: Wrench },
    { name: "Carpintero", icon: Hammer },
    { name: "Pintor", icon: Paintbrush },
    { name: "Albañil", icon: HomeIcon },
    { name: "Jardinero", icon: Scissors },
    { name: "Mecánico", icon: Car },
    { name: "Técnico AC", icon: Snowflake },
    { name: "Gasista", icon: Flame },
    { name: "Cerrajero", icon: Key },
    { name: "Soldador", icon: ZapIcon },
    { name: "Techista", icon: Triangle },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedZone("all");
  };

  useEffect(() => {
    if (id) {
      loadProfessional();
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadProfessional = async () => {
    if (!id) return;

    try {
      // Use appropriate function based on authentication status
      const { data, error } = user
        ? await browseProfessionals()
        : await discoverProfessionals();

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo cargar el profesional",
          variant: "destructive",
        });
        return;
      }

      const prof = data?.find((p: any) => p.id === id);
      if (prof) {
        setProfessional(prof);
        setAvatarUrl(prof.profile_avatar_url);
      } else {
        toast({
          title: "No encontrado",
          description: "El profesional no existe",
          variant: "destructive",
        });
        navigate("/buscar");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cargar el profesional",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para contactar profesionales",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (professional?.whatsapp_phone) {
      const cleanPhone = professional.whatsapp_phone.replace(/[^0-9]/g, "");
      const message = encodeURIComponent(
        `Hola ${professional.profile_full_name}, me interesa contactarte por tus servicios de ${professional.trade_name}.`
      );

      try {
        // Intentar abrir WhatsApp Web primero
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${message}`;
        window.open(whatsappUrl, "_blank");

        toast({
          title: "WhatsApp",
          description: "Abriendo conversación...",
        });
      } catch (error) {
        // Fallback: copiar el número al portapapeles
        navigator.clipboard
          .writeText(cleanPhone)
          .then(() => {
            toast({
              title: "Número copiado",
              description: `Número de WhatsApp: ${professional.whatsapp_phone}`,
            });
          })
          .catch(() => {
            toast({
              title: "Contacto",
              description: `WhatsApp: ${professional.whatsapp_phone}`,
            });
          });
      }
    } else if (professional?.has_contact_info) {
      toast({
        title: "Contacto disponible",
        description:
          "El profesional tiene información de contacto disponible para usuarios registrados",
      });
    } else {
      toast({
        title: "Contacto",
        description: "Información de WhatsApp no disponible",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = (newUrl: string | null) => {
    setAvatarUrl(newUrl);
    // Also update the professional object to reflect the change immediately
    if (professional) {
      setProfessional({
        ...professional,
        profile_avatar_url: newUrl,
      });
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background px-4 py-8'>
        <div className='container mx-auto max-w-4xl'>
          <div className='animate-pulse space-y-8'>
            <div className='h-8 bg-muted rounded w-32'></div>
            <div className='h-12 bg-muted rounded w-3/4'></div>
            <div className='space-y-4'>
              <div className='h-4 bg-muted rounded'></div>
              <div className='h-4 bg-muted rounded w-5/6'></div>
              <div className='h-4 bg-muted rounded w-4/6'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!professional) {
    return (
      <div className='min-h-screen bg-background px-4 py-8'>
        <div className='container mx-auto max-w-4xl text-center'>
          <h1 className='text-2xl font-bold text-foreground mb-4'>
            Profesional no encontrado
          </h1>
          <Button onClick={() => navigate("/buscar")}>Volver a buscar</Button>
        </div>
      </div>
    );
  }

  // Check if current user is the owner of this professional profile
  const isOwner = user && professional && professional.user_id === user?.id;

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-muted/30'>
      <SharedHeader
        showBackButton={true}
        showSearch={true}
        searchProps={{
          searchTerm,
          setSearchTerm,
          selectedZone,
          setSelectedZone,
          popularServices,
          clearFilters,
        }}
      />

      {/* Hero Section - Minimalista estilo Airbnb */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Title and basic info */}
        <div className='space-y-4 mb-8'>
          <h1 className='text-3xl sm:text-4xl font-bold text-foreground'>
            {professional.profile_full_name} - {professional.trade_name}
          </h1>

          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className='w-4 h-4 text-yellow-400 fill-current'
                />
              ))}
              <span className='ml-1 font-medium'>5.0</span>
            </div>

            <div className='flex items-center gap-2'>
              <Clock className='w-4 h-4' />
              <span>{professional.years_experience} años de experiencia</span>
            </div>

            {professional.profile_location_city && (
              <div className='flex items-center gap-2'>
                <MapPin className='w-4 h-4' />
                <span>{professional.profile_location_city}</span>
              </div>
            )}

            <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium'>
              Verificado
            </span>
          </div>
        </div>

        {/* Portfolio Photos - Airbnb style grid */}
        <PortfolioSection
          professionalProfileId={professional?.id}
          isOwner={isOwner || false}
        />
      </div>

      {/* Content Section - Estilo Airbnb */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-border'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Description */}
            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Sobre mi trabajo
              </h2>
              <Card className='border-border/50'>
                <CardContent className='p-6'>
                  <p className='text-muted-foreground leading-relaxed text-base'>
                    {professional.description || "Sin descripción disponible."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Skills */}
            {professional.profile_skills &&
              professional.profile_skills.length > 0 && (
                <div>
                  <h2 className='text-2xl font-bold text-foreground mb-6'>
                    Especialidades
                  </h2>
                  <Card className='border-border/50'>
                    <CardContent className='p-6'>
                      <div className='flex flex-wrap gap-3'>
                        {professional.profile_skills.map(
                          (skill: string, index: number) => (
                            <Badge
                              key={index}
                              variant='secondary'
                              className='px-4 py-2 text-sm bg-primary/10 text-primary hover:bg-primary/20 border-primary/20'
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            {/* Reviews Section */}
            <div>
              <h2 className='text-2xl font-bold text-foreground mb-6'>
                Reseñas de clientes
              </h2>
              <ReviewsSection professionalProfileId={professional?.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1 space-y-6'>
            {/* Contact Card - Sticky */}
            <Card className='bg-card border-border sticky top-6'>
              <CardContent className='p-6 space-y-4'>
                <div className='flex items-center gap-3 mb-4'>
                  <EditableAvatar
                    avatarUrl={avatarUrl}
                    userFullName={professional.profile_full_name}
                    size='sm'
                    onAvatarChange={handleAvatarChange}
                    showUploadButton={false}
                    isOwner={false}
                  />
                  <div>
                    <p className='font-medium text-foreground text-sm'>
                      Contactar a {professional.profile_full_name.split(" ")[0]}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Responde en promedio en 2 horas
                    </p>
                  </div>
                </div>

                {professional.hourly_rate && (
                  <div className='text-center py-3 border-y border-border'>
                    <div className='flex items-center justify-center gap-2'>
                      <DollarSign className='w-5 h-5 text-primary' />
                      <span className='text-2xl font-bold text-foreground'>
                        ARS ${professional.hourly_rate}
                      </span>
                      <span className='text-sm text-muted-foreground'>
                        /hora
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Tarifa orientativa
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleContact}
                  size='lg'
                  className='w-full h-12'
                  variant={user ? "default" : "outline"}
                >
                  <Phone className='w-4 h-4 mr-2' />
                  {user
                    ? "Contactar por WhatsApp"
                    : "Inicia sesión para contactar"}
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className='border-border/50'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-lg'>Datos del profesional</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='flex items-center justify-between py-2 border-b border-border/50 last:border-0'>
                  <span className='text-sm text-muted-foreground'>
                    Experiencia
                  </span>
                  <span className='text-sm font-medium'>
                    {professional.years_experience} años
                  </span>
                </div>
                <div className='flex items-center justify-between py-2 border-b border-border/50 last:border-0'>
                  <span className='text-sm text-muted-foreground'>
                    Valoración
                  </span>
                  <span className='text-sm font-medium'>5.0 ⭐</span>
                </div>
                {professional.profile_location_city && (
                  <div className='flex items-center justify-between py-2'>
                    <span className='text-sm text-muted-foreground'>
                      Ubicación
                    </span>
                    <span className='text-sm font-medium'>
                      {professional.profile_location_city}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className='border-border/50 bg-muted/30'>
              <CardContent className='p-6 space-y-3'>
                <h3 className='font-medium text-sm'>
                  Tu seguridad es importante
                </h3>
                <div className='space-y-2 text-xs text-muted-foreground'>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>
                    <span>Perfil verificado</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>
                    <span>Contacto seguro por WhatsApp</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full bg-green-500'></div>
                    <span>Experiencia verificada</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className='mt-12'>
          <Card className='bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20'>
            <CardContent className='p-8 text-center space-y-4'>
              <h3 className='text-2xl font-bold text-foreground'>
                ¿Listo para comenzar tu proyecto?
              </h3>
              <p className='text-muted-foreground max-w-2xl mx-auto'>
                Contacta a {professional.profile_full_name} para recibir un
                presupuesto personalizado y comenzar a trabajar en tu proyecto
                hoy mismo.
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <Button
                  onClick={handleContact}
                  size='lg'
                  className='h-12 px-8'
                  variant={user ? "default" : "outline"}
                >
                  <Phone className='w-4 h-4 mr-2' />
                  {user
                    ? "Contactar por WhatsApp"
                    : "Inicia sesión para contactar"}
                </Button>
                <p className='text-sm text-muted-foreground'>
                  Respuesta garantizada en 24 horas
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Spacer to push footer below the fold */}
      <div className='h-screen'></div>

      <Footer />
    </div>
  );
}
