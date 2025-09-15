import { useState } from 'react';
import { supabase } from '@/src/integrations/supabase/client';
import { useToast } from '@/src/shared/hooks/use-toast';

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
        .from('portfolio_photos')
        .select('*')
        .eq('professional_profile_id', professionalProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error: any) {
      console.error('Error fetching portfolio photos:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const uploadPortfolioPhoto = async (photoData: CreatePortfolioPhotoData, userId: string) => {
    setLoading(true);
    try {
      // Generate unique filename
      const fileExt = photoData.file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Upload image to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(fileName, photoData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(fileName);

      // Save photo data to database
      const { error: dbError } = await supabase
        .from('portfolio_photos')
        .insert({
          professional_profile_id: photoData.professional_profile_id,
          title: photoData.title,
          description: photoData.description,
          image_url: publicUrl
        });

      if (dbError) throw dbError;

      toast({
        title: "¡Foto subida!",
        description: "Tu foto de trabajo ha sido agregada al portafolio",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error uploading portfolio photo:', error);
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

  const updatePortfolioPhoto = async (photoId: string, title: string, description: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('portfolio_photos')
        .update({ 
          title, 
          description, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', photoId);

      if (error) throw error;

      toast({
        title: "¡Foto actualizada!",
        description: "La información de la foto ha sido actualizada",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating portfolio photo:', error);
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
      // Extract file path from URL
      const urlParts = imageUrl.split('/portfolio/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        
        // Delete from storage
        await supabase.storage
          .from('portfolio')
          .remove([filePath]);
      }

      // Delete from database
      const { error } = await supabase
        .from('portfolio_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      toast({
        title: "Foto eliminada",
        description: "La foto ha sido eliminada del portafolio",
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting portfolio photo:', error);
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

  return {
    loading,
    getPortfolioPhotos,
    uploadPortfolioPhoto,
    updatePortfolioPhoto,
    deletePortfolioPhoto
  };
};