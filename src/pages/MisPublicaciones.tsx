"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Badge } from '@/src/shared/components/ui/badge';
import { useToast } from '@/src/shared/hooks/use-toast';
import { useAuthState } from '@/src/features/auth'
import { EditableAvatar } from '@/src/shared/components/EditableAvatar';
import { useMyProfessionalProfiles } from '@/src/features/professionals';
import { SharedHeader } from '@/src/shared/components/SharedHeader';

export default function MisPublicaciones() {
  const { user, loading } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading: profilesLoading, myProfiles, loadMyProfiles, deleteProfessionalProfile } = useMyProfessionalProfiles();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadMyProfiles();
  }, [user]);

  const handleDeleteProfile = async (profileId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.')) {
      const success = await deleteProfessionalProfile(profileId);
      if (success) {
        toast({
          title: "Publicación eliminada",
          description: "La publicación ha sido eliminada exitosamente",
        });
        loadMyProfiles(); // Reload the list
      }
    }
  };

  const handleCreateNew = () => {
    navigate('/publicar');
  };

  const handleEditProfile = (profileId: string) => {
    navigate(`/profesional?id=${profileId}`);
  };

  const handleViewProfile = (profileId: string) => {
    navigate(`/profesional?id=${profileId}`);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader showBackButton={true} title="Mis Publicaciones" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">Mis publicaciones</h1>
            <p className="text-muted-foreground mt-2">
              Gestiona tus servicios profesionales y crea nuevas publicaciones
            </p>
          </div>
          <Button
            onClick={handleCreateNew}
            size="lg"
            className="flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nueva publicación
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="h-16 w-16 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-muted rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded-full w-16"></div>
                      <div className="h-6 bg-muted rounded-full w-20"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : myProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProfiles.map((profile) => (
              <Card key={profile.id} className="border-border/50 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Profile Header */}
                    <div className="flex gap-4">
                      <EditableAvatar
                        avatarUrl={profile.profile_avatar_url}
                        userFullName={profile.profile_full_name}
                        size="md"
                        showUploadButton={false}
                        isOwner={true}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {profile.trade_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {profile.years_experience} años de experiencia
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {profile.profile_location_city}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {profile.description || 'Sin descripción'}
                    </p>

                    {/* Skills */}
                    {profile.profile_skills && profile.profile_skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {profile.profile_skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {profile.profile_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{profile.profile_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Rate */}
                    {profile.hourly_rate && (
                      <div className="text-sm">
                        <span className="font-semibold text-primary">
                          ARS ${profile.hourly_rate}/hora
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(profile.id)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProfile(profile.id)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No tienes publicaciones aún
              </h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primera publicación para empezar a ofrecer tus servicios profesionales
              </p>
              <Button onClick={handleCreateNew} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Crear mi primera publicación
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}