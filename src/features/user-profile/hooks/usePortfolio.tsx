import { useState } from "react";
import { supabase } from "@/src/integrations/supabase/client";
import { useToast } from "@/src/shared/hooks/use-toast";

export interface PortfolioPhoto {
  id: string;
  professional_profile_id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePortfolioPhotoData {
  professional_profile_id: string;
  title: string;
  description: string;
  file: File;
}

export const usePortfolio = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getPortfolioPhotos = async (professionalProfileId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("portfolio_photos")
        .select("*")
        .eq("professional_profile_id", professionalProfileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const uploadPortfolioPhoto = async (
    photoData: CreatePortfolioPhotoData,
    userId: string
  ) => {
    setLoading(true);
    try {
      // Create FormData to send file and other data
      const formData = new FormData();
      formData.append("file", photoData.file);
      formData.append(
        "professional_profile_id",
        photoData.professional_profile_id
      );
      formData.append("title", photoData.title);
      formData.append("description", photoData.description);

      // Send to API endpoint
      const response = await fetch("/api/user-profile/portfolio/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al subir la foto");
      }

      const result = await response.json();

      // Check if this is the first photo and set as main image
      const { data: existingPhotos } = await supabase
        .from("portfolio_photos")
        .select("id")
        .eq("professional_profile_id", photoData.professional_profile_id);

      const isFirstPhoto = existingPhotos && existingPhotos.length === 1;

      if (isFirstPhoto && result.data?.image_url) {
        await fetch(`/api/professionals/${photoData.professional_profile_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ main_portfolio_image: result.data.image_url }),
        });
      }

      toast({
        title: "¡Foto subida!",
        description: isFirstPhoto
          ? "Tu foto ha sido agregada y establecida como imagen principal"
          : "Tu foto de trabajo ha sido agregada al portafolio",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al subir la foto",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updatePortfolioPhoto = async (
    photoId: string,
    title: string,
    description: string
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/portfolio/${photoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update photo");
      }

      toast({
        title: "¡Foto actualizada!",
        description: "La información de la foto ha sido actualizada",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar la foto",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolioPhoto = async (photoId: string, imageUrl: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        id: photoId,
        imageUrl: imageUrl,
      });

      const response = await fetch(
        `/api/user-profile/portfolio/?${params.toString()}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar la foto");
      }

      toast({
        title: "Foto eliminada",
        description: "La foto ha sido eliminada del portafolio",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al eliminar la foto",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const setAsMainImage = async (
    professionalProfileId: string,
    imageUrl: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/professionals/${professionalProfileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ main_portfolio_image: imageUrl }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      toast({
        title: "Imagen principal actualizada",
        description:
          "Esta foto ahora aparecerá como imagen principal en tu perfil.",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al establecer la imagen principal",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getPortfolioPhotos,
    uploadPortfolioPhoto,
    updatePortfolioPhoto,
    deletePortfolioPhoto,
    setAsMainImage,
  };
};
