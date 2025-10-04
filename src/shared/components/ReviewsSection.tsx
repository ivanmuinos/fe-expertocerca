"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, Send, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/src/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Badge } from "@/src/shared/components/ui/badge";
import { useReviews, type Review } from "@/src/features/user-profile";
import { useAuthState } from "@/src/features/auth";

interface ReviewsSectionProps {
  professionalProfileId: string;
  professionalUserId?: string;
}

export function ReviewsSection({
  professionalProfileId,
  professionalUserId,
}: ReviewsSectionProps) {
  const { user, loading: authLoading } = useAuthState();
  const isOwner = user && professionalUserId && user.id === professionalUserId;
  const {
    getReviews,
    createReview,
    updateReview,
    deleteReview,
    getAverageRating,
    loading,
  } = useReviews();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
  });

  const loadReviews = useCallback(async () => {
    const { data } = await getReviews(professionalProfileId);
    if (data) {
      setReviews(data);
    }
  }, [getReviews, professionalProfileId]);

  const loadAverageRating = useCallback(async () => {
    const { average, count } = await getAverageRating(professionalProfileId);
    setAverageRating(average);
    setReviewCount(count);
  }, [getAverageRating, professionalProfileId]);

  useEffect(() => {
    loadReviews();
    loadAverageRating();
  }, [professionalProfileId]);

  const handleSubmit = async () => {
    if (!user) return;

    if (editingReview) {
      const { success } = await updateReview(
        editingReview.id,
        formData.rating,
        formData.comment
      );
      if (success) {
        setEditingReview(null);
        loadReviews();
        loadAverageRating();
      }
    } else {
      const { success } = await createReview(
        {
          professional_profile_id: professionalProfileId,
          rating: formData.rating,
          comment: formData.comment,
        },
        user.id
      );
      if (success) {
        setShowForm(false);
        loadReviews();
        loadAverageRating();
      }
    }

    setFormData({ rating: 5, comment: "" });
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setFormData({
      rating: review.rating,
      comment: review.comment || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (reviewId: string) => {
    const { success } = await deleteReview(reviewId);
    if (success) {
      loadReviews();
      loadAverageRating();
    }
  };

  const renderStars = (
    rating: number,
    interactive: boolean = false,
    onRatingChange?: (rating: number) => void
  ) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-yellow-400 fill-current" : "text-muted-foreground"
        } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
        onClick={() => interactive && onRatingChange?.(i + 1)}
      />
    ));
  };

  const userHasReviewed = reviews.some(
    (review) => review.reviewer_user_id === user?.id
  );

  return (
    <div>
      {/* Divider */}
      <div className='border-t border-gray-200 mb-8'></div>

      <div>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h2 className='text-xl sm:text-xl font-bold'>Reseñas</h2>
            {reviewCount > 0 && (
              <div className='flex items-center gap-2 mt-2'>
                <div className='flex items-center gap-1'>
                  {renderStars(Math.round(averageRating))}
                </div>
                <span className='text-lg font-medium'>{averageRating}</span>
                <Badge variant='secondary'>
                  {reviewCount} {reviewCount === 1 ? "reseña" : "reseñas"}
                </Badge>
              </div>
            )}
          </div>

          {user && !userHasReviewed && !showForm && !isOwner && (
            <Button onClick={() => setShowForm(true)}>Escribir reseña</Button>
          )}
        </div>

        <div className='space-y-6'>
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className='bg-muted/30 p-6 rounded-lg text-center'>
              <p className='text-muted-foreground mb-4'>
                Inicia sesión para dejar una reseña sobre este profesional
              </p>
              <Button
                variant='outline'
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openLoginModal"))
                }
              >
                Iniciar sesión
              </Button>
            </div>
          )}

          {/* Review form */}
          {user && showForm && (
            <div className='bg-gray-50 rounded-lg p-6 space-y-4'>
              <h4 className='text-lg font-semibold'>
                {editingReview ? "Editar reseña" : "Escribe tu reseña"}
              </h4>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Calificación</label>
                <div className='flex gap-2'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className='focus:outline-none transition-transform hover:scale-110'
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className='ml-2 text-sm text-muted-foreground self-center'>
                    {formData.rating}{" "}
                    {formData.rating === 1 ? "estrella" : "estrellas"}
                  </span>
                </div>
              </div>

              <div className='space-y-2'>
                <label className='text-sm font-medium'>Comentario</label>
                <Textarea
                  value={formData.comment}
                  onChange={(e) =>
                    setFormData({ ...formData, comment: e.target.value })
                  }
                  placeholder='Comparte tu experiencia con este profesional...'
                  rows={4}
                />
              </div>

              <div className='flex gap-3'>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.comment.trim()}
                >
                  <Send className='w-4 h-4 mr-2' />
                  {editingReview ? "Actualizar" : "Enviar reseña"}
                </Button>
                <Button
                  variant='outline'
                  onClick={() => {
                    setShowForm(false);
                    setEditingReview(null);
                    setFormData({ rating: 5, comment: "" });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Reviews list */}
          {reviews.length === 0 ? (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>
                Aún no hay reseñas para este profesional. ¡Sé el primero en
                dejar una!
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {reviews.map((review) => (
                <div key={review.id} className='bg-gray-50 rounded-lg p-4'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='font-medium'>
                          {review.reviewer_name}
                        </span>
                        <div className='flex items-center gap-1'>
                          {renderStars(review.rating)}
                        </div>
                        <span className='text-sm text-muted-foreground'>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className='text-muted-foreground'>
                          {review.comment}
                        </p>
                      )}
                    </div>

                    {/* Edit/Delete buttons for review owner */}
                    {user?.id === review.reviewer_user_id && (
                      <div className='flex gap-2 ml-4'>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleEdit(review)}
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
