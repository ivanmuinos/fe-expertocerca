import { useState, useCallback } from "react";
import { apiClient } from "@/src/shared/lib/api-client";
import { useToast } from "@/src/shared/hooks/use-toast";
import { useAuthState } from "@/src/features/auth";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/src/shared/lib/query-keys";

interface MyProfessionalProfile {
  id: string;
  trade_name: string;
  description: string;
  years_experience: number;
  hourly_rate?: number;
  whatsapp_phone?: string;
  work_phone?: string;
  user_id: string;
  profile_full_name: string;
  profile_location_city: string;
  profile_location_province: string;
  profile_skills: string[];
  profile_avatar_url?: string;
  main_portfolio_image?: string;
  created_at: string;
  updated_at: string;
}

export function useMyProfessionalProfiles() {
  const [loading, setLoading] = useState(false);
  const [myProfiles, setMyProfiles] = useState<MyProfessionalProfile[]>([]);
  const { toast } = useToast();
  const { user } = useAuthState();
  const queryClient = useQueryClient();

  /**
   * Load all professional profiles for the current user
   * SOLUCIÓN 1: Usar solo user?.id como dependencia
   */
  const loadMyProfiles = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await apiClient.get("/my-profiles");
      setMyProfiles((data as MyProfessionalProfile[]) || []);
    } catch (error) {
      console.error("Error loading profiles:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar tus publicaciones",
        variant: "destructive",
      });
      setMyProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, toast]); // Solo dependencias primitivas

  /**
   * Delete a professional profile
   */
  const deleteProfessionalProfile = async (
    profileId: string
  ): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Optimistic update: remove from local state BEFORE the API call
      setMyProfiles((prev) => prev.filter((p) => p.id !== profileId));

      await apiClient.delete(`/my-profiles?id=${profileId}`);

      // Remove from cache to prevent refetch attempts
      queryClient.removeQueries({
        queryKey: ['professional', profileId],
      });

      // Invalidar cache de professionals para que se actualice la home
      queryClient.invalidateQueries({
        queryKey: queryKeys.professionals.lists(),
      });

      toast({
        title: "Publicación eliminada",
        description: "Tu publicación ha sido eliminada exitosamente",
      });

      return true;
    } catch (error) {
      // Rollback optimistic update on error
      await loadMyProfiles();
      
      toast({
        title: "Error",
        description: "No se pudo eliminar la publicación",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * Get a single professional profile by ID (for the current user)
   */
  const getMyProfile = async (
    profileId: string
  ): Promise<MyProfessionalProfile | null> => {
    if (!user?.id) return null;

    try {
      const data = await apiClient.get(`/my-profiles/${profileId}`);
      return data as MyProfessionalProfile;
    } catch (error) {
      return null;
    }
  };

  return {
    loading,
    myProfiles,
    loadMyProfiles,
    deleteProfessionalProfile,
    getMyProfile,
  };
}
