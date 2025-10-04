"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { Plus, Trash2, Eye, Copy, PencilLine } from "lucide-react";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
import MisPublicationsSkeleton from "@/src/shared/components/MisPublicationsSkeleton";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { useMyProfessionalProfiles } from "@/src/features/professionals";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
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
} from "@/src/shared/components/ui/alert-dialog";
import {
  useOnboardingProgress,
  OnboardingStep,
} from "@/src/shared/stores/useOnboardingProgressStore";

export default function MyPublicationsPage() {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    loading: profilesLoading,
    myProfiles,
    loadMyProfiles,
    deleteProfessionalProfile,
  } = useMyProfessionalProfiles();
  const { setCurrentStep } = useOnboardingProgress();

  const [hasLoadedProfiles, setHasLoadedProfiles] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (user.id && !hasLoadedProfiles) {
      loadMyProfiles().then(() => setHasLoadedProfiles(true));
    }
  }, [user?.id, loading, loadMyProfiles, hasLoadedProfiles]);

  useEffect(() => {
    console.log("Current profiles:", myProfiles);
    console.log("Profiles loading:", profilesLoading);
  }, [myProfiles, profilesLoading]);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleDeleteProfile = async (profileId: string) => {
    try {
      setDeletingId(profileId);
      const success = await deleteProfessionalProfile(profileId);
      if (success) {
        setHasLoadedProfiles(false);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const [createLoading, setCreateLoading] = useState(false);
  const handleCreateNew = () => {
    setCurrentStep(OnboardingStep.SPECIALTY_SELECTION);
    setCreateLoading(true);
    navigate("/onboarding/specialty-selection");
    setTimeout(() => setCreateLoading(false), 600);
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/publication?id=${profileId}`);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className='min-h-screen'>
      <SharedHeader showBackButton={true} title='Mis Publicaciones' />
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12'>
          <div>
            <h1 className='text-3xl sm:text-4xl font-semibold text-foreground mb-3'>
              Mis publicaciones
            </h1>
            <p className='text-muted-foreground text-lg'>
              Gestiona tus servicios profesionales y crea nuevas publicaciones
            </p>
          </div>
          <LoadingButton
            onClick={handleCreateNew}
            className='bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2'
            loading={createLoading}
            loadingText='Abriendo'
          >
            <Plus className='w-5 h-5' />
            Nueva publicación
          </LoadingButton>
        </div>

        {profilesLoading ? (
          <MisPublicationsSkeleton />
        ) : myProfiles.length > 0 ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            {myProfiles.map((profile) => (
              <div
                key={profile.id}
                className='bg-card border border-border rounded-2xl p-0 overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]'
              >
                <div className='space-y-4'>
                  {/* Main image preview */}
                  <div className='aspect-video bg-muted overflow-hidden'>
                    {profile.main_portfolio_image ? (
                      <img
                        src={profile.main_portfolio_image}
                        alt={profile.trade_name || "Publicación"}
                        className='w-full h-full object-cover'
                        loading='lazy'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center text-muted-foreground'>
                        Sin imagen principal
                      </div>
                    )}
                  </div>

                  <div className='px-4 sm:px-6 flex gap-4'>
                    <EditableAvatar
                      avatarUrl={profile.profile_avatar_url}
                      userFullName={profile.profile_full_name}
                      size='md'
                      showUploadButton={false}
                      isOwner={true}
                    />
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-semibold text-foreground truncate text-lg'>
                        {profile.trade_name}
                      </h3>
                      <div className='text-muted-foreground text-sm space-y-0.5'>
                        {profile.profile_location_city && (
                          <p>{profile.profile_location_city}</p>
                        )}
                        {profile.specialty && (
                          <p>Especialidad: {profile.specialty}</p>
                        )}
                        {typeof profile.years_experience === "number" && (
                          <p>Experiencia: {profile.years_experience} años</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {profile.profile_skills &&
                    profile.profile_skills.length > 0 && (
                      <div className='flex flex-wrap gap-2 px-4 sm:px-6'>
                        {profile.profile_skills
                          .slice(0, 4)
                          .map((skill, index) => (
                            <span
                              key={index}
                              className='px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium'
                            >
                              {skill}
                            </span>
                          ))}
                        {profile.profile_skills.length > 4 && (
                          <span className='px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm border border-border'>
                            +{profile.profile_skills.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                  <div className='flex items-center justify-between px-4 sm:px-6'>
                    {profile.hourly_rate ? (
                      <div className='bg-muted border border-border rounded-xl px-3 py-2'>
                        <span className='font-semibold text-foreground'>
                          ${profile.hourly_rate}
                        </span>
                        <span className='text-muted-foreground text-sm ml-1'>
                          ARS / hora
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/publication/?id=${profile.id}`
                          );
                        } catch {}
                      }}
                      className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1'
                      title='Copiar enlace'
                    >
                      <Copy className='w-3.5 h-3.5' /> Copiar enlace
                    </button>
                  </div>

                  <div className='flex items-center gap-2 pt-2 px-4 sm:px-6 pb-4'>
                    <button
                      onClick={() => handleViewProfile(profile.id)}
                      className='flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium py-2.5 px-2 sm:px-4 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1 sm:gap-2'
                    >
                      <Eye className='w-4 h-4' />
                      <span className='hidden sm:inline'>Ver publicación</span>
                      <span className='sm:hidden'>Ver</span>
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className='px-3 py-2 border border-destructive/20 hover:border-destructive/40 text-destructive hover:text-destructive/80 rounded-xl transition-colors flex items-center gap-1'>
                          <Trash2 className='w-4 h-4' />
                          <span className='hidden sm:inline'>Eliminar</span>
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            ¿Eliminar publicación?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProfile(profile.id)}
                            disabled={deletingId === profile.id}
                          >
                            {deletingId === profile.id
                              ? "Eliminando..."
                              : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center py-20'>
            <div className='max-w-md mx-auto bg-card border border-border rounded-2xl p-12'>
              <div className='w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center'>
                <Plus className='w-12 h-12 text-muted-foreground' />
              </div>
              <h3 className='text-2xl font-semibold text-foreground mb-3'>
                No tienes publicaciones aún
              </h3>
              <p className='text-muted-foreground mb-8 leading-relaxed'>
                Crea tu primera publicación para empezar a ofrecer tus servicios
                profesionales
              </p>
              <button
                onClick={handleCreateNew}
                className='bg-primary hover:bg-primary-dark text-primary-foreground font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto'
              >
                <Plus className='w-5 h-5' />
                Crear mi primera publicación
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
