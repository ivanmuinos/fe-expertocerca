"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import {
  MapPin,
  Phone,
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
import { useToast } from "@/src/shared/hooks/use-toast";
import { useSecureProfessionals } from "@/src/features/professionals";
import { ReviewsSection } from "@/src/shared/components/ReviewsSection";
import { PortfolioSection } from "@/src/shared/components/PortfolioSection";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { Footer } from "@/src/shared/components";
import { useMobile } from "@/src/shared/components/MobileWrapper";

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
  const { isMobileNavbarVisible } = useMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedZone, setSelectedZone] = useState("all");

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
    { name: "Técnico en aires", icon: Snowflake },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProfessional = async () => {
    if (!id) return;

    try {
      // Try to get individual professional with metadata first
      try {
        const response = await fetch(`/api/professionals/${id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setProfessional(result.data);
            setAvatarUrl(result.data.profile_avatar_url);
            return;
          }
        }
      } catch (individualError) {
        console.log(
          "Individual fetch failed, falling back to list:",
          individualError
        );
      }

      // Fallback to original method
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

  const isOwner = user && professional && professional.user_id === user?.id;

  return (
    <div className='min-h-screen'>
      <SharedHeader
        showBackButton={true}
        showSearch={false}
        searchCollapsed={true}
        variant='default'
        searchProps={{
          searchTerm,
          setSearchTerm,
          selectedZone,
          setSelectedZone,
          popularServices,
          clearFilters,
        }}
      />

      <div className='max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-8 lg:pb-8'>
        {/* Mobile Hero Section */}
        <div className='lg:hidden mb-6'>
          <div className='bg-card rounded-xl p-4 shadow-sm border border-border'>
            <div className='flex items-center gap-3 mb-4'>
              <EditableAvatar
                avatarUrl={avatarUrl}
                userFullName={professional.profile_full_name}
                size='md'
                onAvatarChange={handleAvatarChange}
                showUploadButton={false}
                isOwner={false}
              />
              <div className='flex-1'>
                <h1 className='text-lg font-bold text-foreground leading-tight'>
                  {professional.profile_full_name}
                </h1>
                {professional.profile_location_city && (
                  <div className='flex items-center gap-1 mt-1'>
                    <MapPin className='w-3 h-3 text-gray-500' />
                    <span className='text-sm text-gray-600'>
                      {professional.profile_location_city}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Specialties */}
            {professional.profile_skills &&
              professional.profile_skills.length > 0 && (
                <div className='mb-4'>
                  <div className='flex flex-wrap gap-1.5'>
                    {professional.profile_skills
                      .slice(0, 3)
                      .map((skill: string, index: number) => (
                        <span
                          key={index}
                          className='px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium'
                        >
                          {skill}
                        </span>
                      ))}
                    {professional.profile_skills.length > 3 && (
                      <span className='px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-200'>
                        +{professional.profile_skills.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              )}

            {/* Mobile WhatsApp Info */}
            {professional.whatsapp_phone && user && (
              <div className='p-3 bg-green-50 border border-green-200 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <div className='w-6 h-6 bg-green-100 rounded-full flex items-center justify-center'>
                    <Phone className='w-3 h-3 text-green-600' />
                  </div>
                  <span className='font-medium text-green-800 text-sm'>
                    WhatsApp
                  </span>
                </div>
                <p className='text-green-700 font-mono text-xs mt-1 ml-8'>
                  {professional.whatsapp_phone}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8'>
          {/* Desktop Sidebar */}
          <div className='hidden lg:block lg:col-span-5 xl:col-span-4'>
            <div className='lg:sticky lg:top-20 space-y-6'>
              <div className='bg-card rounded-2xl p-6 shadow-sm border border-border'>
                <div className='flex items-center gap-4 mb-6 mt-8'>
                  <EditableAvatar
                    avatarUrl={avatarUrl}
                    userFullName={professional.profile_full_name}
                    size='lg'
                    onAvatarChange={handleAvatarChange}
                    showUploadButton={false}
                    isOwner={false}
                  />
                  <div>
                    <h3 className='text-xl font-bold text-foreground'>
                      {professional.profile_full_name}
                    </h3>
                  </div>
                </div>

                {/* Specialties */}
                {professional.profile_skills &&
                  professional.profile_skills.length > 0 && (
                    <div className='mb-6'>
                      <h4 className='font-semibold text-foreground mb-3'>
                        Especialidades
                      </h4>
                      <div className='flex flex-wrap gap-2'>
                        {professional.profile_skills
                          .slice(0, 4)
                          .map((skill: string, index: number) => (
                            <span
                              key={index}
                              className='px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors'
                            >
                              {skill}
                            </span>
                          ))}
                        {professional.profile_skills.length > 4 && (
                          <span className='px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full text-sm border border-gray-200'>
                            +{professional.profile_skills.length - 4} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                {/* Work Zones */}
                {professional.profile_location_city && (
                  <div className='mb-6'>
                    <h4 className='font-semibold text-gray-900 mb-3'>
                      Zona de trabajo
                    </h4>
                    <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100'>
                      <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                        <MapPin className='w-4 h-4 text-red-600' />
                      </div>
                      <span className='text-gray-700 font-medium'>
                        {professional.profile_location_city}
                      </span>
                    </div>
                  </div>
                )}

                <div className='space-y-4'>
                  {professional.whatsapp_phone && user && (
                    <div className='p-4 bg-green-50 border border-green-200 rounded-xl mb-4'>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='w-8 h-8 bg-green-100 rounded-full flex items-center justify-center'>
                          <Phone className='w-4 h-4 text-green-600' />
                        </div>
                        <span className='font-semibold text-green-800'>
                          WhatsApp
                        </span>
                      </div>
                      <p className='text-green-700 font-mono text-sm ml-11'>
                        {professional.whatsapp_phone}
                      </p>
                    </div>
                  )}

                  {/* Professional CTA button */}
                  <button
                    onClick={handleContact}
                    className='w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl'
                  >
                    {user
                      ? "Contactar por WhatsApp"
                      : "Inicia sesión para contactar"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-7 xl:col-span-8 space-y-6 lg:space-y-8'>
            {/* About Section */}
            <div>
              <h2 className='text-xl lg:text-2xl font-semibold text-gray-900 mb-4 lg:mb-8 px-1'>
                Sobre mi trabajo
              </h2>
              <div className='bg-white border border-gray-200 rounded-xl lg:rounded-2xl p-4 lg:p-8'>
                <p className='text-gray-700 leading-relaxed text-base lg:text-lg'>
                  {professional.description ||
                    "Profesional comprometido con la excelencia y la satisfacción del cliente. Brindo servicios de alta calidad con atención al detalle y dedicación en cada proyecto."}
                </p>
              </div>
            </div>

            {/* Portfolio Section */}
            <div>
              <PortfolioSection
                professionalProfileId={professional?.id}
                isOwner={user?.id === professional?.user_id}
              />
            </div>

            {/* Reviews Section */}
            <div>
              <ReviewsSection professionalProfileId={professional?.id} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Contact Button - Above navbar */}
      <div
        className={`fixed left-3 right-3 lg:hidden z-40 transition-all duration-300 ${
          isMobileNavbarVisible ? 'bottom-16 mb-6' : 'bottom-3 mb-3'
        }`}
      >
        <button
          onClick={handleContact}
          className='w-full bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] shadow-lg'
        >
          <Phone className='w-4 h-4' />
          <span className='text-sm'>
            {user ? "Contactar por WhatsApp" : "Inicia sesión para contactar"}
          </span>
        </button>
      </div>

      <Footer />
    </div>
  );
}
