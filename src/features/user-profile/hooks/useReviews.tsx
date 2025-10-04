import { useState } from 'react';
import { supabase } from '@/src/config/supabase';
import { useToast } from '@/src/shared/hooks/use-toast';

export interface Review {
  id: string;
  professional_profile_id: string;
  reviewer_user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
}

export interface CreateReviewData {
  professional_profile_id: string;
  rating: number;
  comment: string;
}

export const useReviews = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getReviews = async (professionalProfileId: string) => {
    setLoading(true);
    try {
      const { data: reviews, error } = await supabase.rpc('get_reviews_with_names', {
        _professional_profile_id: professionalProfileId
      });

      if (error) throw error;

      return { data: reviews || [], error: null };
    } catch (error: any) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const createReview = async (reviewData: CreateReviewData, userId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create review');
      }

      toast({
        title: "¡Reseña enviada!",
        description: "Tu reseña ha sido publicada exitosamente",
      });

      return { success: true };
    } catch (error: any) {
      // Handle unique constraint violation (user already reviewed)
      if (error.message?.includes('duplicate') || error.message?.includes('already')) {
        toast({
          title: "Error",
          description: "Ya has dejado una reseña para este profesional",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Hubo un problema al enviar tu reseña",
          variant: "destructive",
        });
      }

      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId: string, rating: number, comment: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update review');
      }

      toast({
        title: "¡Reseña actualizada!",
        description: "Tu reseña ha sido actualizada exitosamente",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar tu reseña",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete review');
      }

      toast({
        title: "Reseña eliminada",
        description: "Tu reseña ha sido eliminada exitosamente",
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al eliminar tu reseña",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = async (professionalProfileId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('professional_profile_id', professionalProfileId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { average: 0, count: 0 };
      }

      const total = data.reduce((sum, review) => sum + review.rating, 0);
      const average = total / data.length;

      return { average: Math.round(average * 10) / 10, count: data.length };
    } catch (error: any) {
      return { average: 0, count: 0 };
    }
  };

  return {
    loading,
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    getAverageRating
  };
};