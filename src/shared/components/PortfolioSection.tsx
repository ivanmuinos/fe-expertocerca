"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus,
  Trash2,
  Upload,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Grid3x3,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/src/shared/components/ui/button";
import { LoadingButton } from "@/src/shared/components/ui/loading-button";
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
import { Card, CardContent } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePortfolio, type PortfolioPhoto } from "@/src/features/user-profile";
import { useAuthState } from "@/src/features/auth";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable photo item component
function SortablePhotoItem({
  photo,
  index,
  isMainPhoto,
  isOwner,
  onClick,
}: {
  photo: PortfolioPhoto;
  index: number;
  isMainPhoto: boolean;
  isOwner: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: !isOwner });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // 4x4 grid - all photos are equal size
  const gridClass = "col-span-1 row-span-1";

  const handleClick = () => {
    // Only trigger onClick if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative overflow-hidden group aspect-square ${gridClass}`}
      {...attributes}
    >
      {/* Click area - covers entire image */}
      <div
        className='absolute inset-0 cursor-pointer z-10'
        onClick={handleClick}
      >
        <Image
          src={photo.image_url}
          alt={photo.title}
          fill
          sizes={
            index === 0
              ? "(max-width: 768px) 100vw, 50vw"
              : "(max-width: 768px) 50vw, 25vw"
          }
          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
          priority={index === 0}
        />
      </div>

      {/* Drag handle - only visible for owner */}
      {isOwner && (
        <div
          className='absolute top-2 left-2 bg-white/80 hover:bg-white rounded-md p-1.5 cursor-move z-20'
          {...listeners}
        >
          <svg
            width='16'
            height='16'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M3 6h10M3 10h10'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
            />
          </svg>
        </div>
      )}

      {isMainPhoto && isOwner && (
        <div className='absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-semibold shadow-lg z-20'>
          <Star className='w-3 h-3 fill-white' />
          Principal
        </div>
      )}
    </div>
  );
}

interface PortfolioSectionProps {
  professionalProfileId: string;
  isOwner: boolean;
  initialMainImage?: string | null;
}

export function PortfolioSection({
  professionalProfileId,
  isOwner,
  initialMainImage = null,
}: PortfolioSectionProps) {
  const { user } = useAuthState();
  const {
    getPortfolioPhotos,
    uploadPortfolioPhoto,
    deletePortfolioPhoto,
    setAsMainImage,
    updatePortfolioPhoto,
    loading,
  } = usePortfolio();
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [mainPortfolioImage, setMainPortfolioImage] = useState<string | null>(
    initialMainImage
  );
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingMain, setIsSettingMain] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PortfolioPhoto | null>(
    null
  );
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState(false);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [showGridView, setShowGridView] = useState(false);
  const [showDetailsSheet, setShowDetailsSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadPhotos = useCallback(async () => {
    setLoadingPhotos(true);
    try {
      // Get all photos
      const { data } = await getPortfolioPhotos(professionalProfileId);
      if (data) {
        // Sort photos: main image first, then by created_at
        const currentMainImage = mainPortfolioImage || initialMainImage;
        const sortedPhotos = [...data].sort((a, b) => {
          if (currentMainImage && a.image_url === currentMainImage) return -1;
          if (currentMainImage && b.image_url === currentMainImage) return 1;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        setPhotos(sortedPhotos);
      }
    } finally {
      setLoadingPhotos(false);
    }
  }, [
    getPortfolioPhotos,
    professionalProfileId,
    mainPortfolioImage,
    initialMainImage,
  ]);

  useEffect(() => {
    loadPhotos();
  }, [professionalProfileId]);

  // Keyboard navigation for photo modal
  useEffect(() => {
    if (!showPhotoModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePreviousPhoto();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextPhoto();
      } else if (e.key === "Escape") {
        setShowPhotoModal(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPhotoModal, selectedPhotoIndex, photos]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
      } else {
        alert("Por favor selecciona solo archivos de imagen");
      }
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) return;

    const { success } = await uploadPortfolioPhoto(
      {
        professional_profile_id: professionalProfileId,
        title: formData.title,
        description: formData.description,
        file: selectedFile,
      },
      user.id
    );

    if (success) {
      setShowUploadDialog(false);
      setSelectedFile(null);
      setFormData({ title: "", description: "" });
      loadPhotos();
    }
  };

  const handleDelete = async (photo: PortfolioPhoto) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      const { success } = await deletePortfolioPhoto(photo.id, photo.image_url);
      if (success) {
        loadPhotos();
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "" });
    setSelectedFile(null);
  };

  const handlePhotoClick = (photo: PortfolioPhoto, index: number) => {
    setSelectedPhoto(photo);
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePreviousPhoto = () => {
    const newIndex =
      selectedPhotoIndex > 0 ? selectedPhotoIndex - 1 : photos.length - 1;
    setSelectedPhotoIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleNextPhoto = () => {
    const newIndex =
      selectedPhotoIndex < photos.length - 1 ? selectedPhotoIndex + 1 : 0;
    setSelectedPhotoIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  const handleSetAsMain = async (photo: PortfolioPhoto) => {
    try {
      setIsSettingMain(true);
      const { success } = await setAsMainImage(
        professionalProfileId,
        photo.image_url
      );
      if (success) {
        // Optimistic update: move selected to first and update state
        setMainPortfolioImage(photo.image_url);
        setPhotos((prev) => {
          const next = [...prev];
          const idx = next.findIndex((p) => p.id === photo.id);
          if (idx > -1) {
            const [item] = next.splice(idx, 1);
            next.unshift(item);
          }
          return next;
        });
        await loadPhotos();
        setShowPhotoModal(false);
      }
    } finally {
      setIsSettingMain(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header (upload dialog kept; trigger moved to grid tile) */}
      <div className='flex items-center justify-between'>
        {isOwner && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogContent className='max-w-md'>
              <DialogHeader>
                <DialogTitle>Subir nueva foto</DialogTitle>
              </DialogHeader>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='file'>Foto del trabajo</Label>
                  <div className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center'>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/*'
                      onChange={handleFileSelect}
                      className='hidden'
                    />
                    {selectedFile ? (
                      <div className='space-y-2'>
                        <Image
                          src={URL.createObjectURL(selectedFile)}
                          alt='Preview'
                          width={400}
                          height={128}
                          className='w-full h-32 object-cover rounded-lg'
                        />
                        <p className='text-sm text-muted-foreground'>
                          {selectedFile.name}
                        </p>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className='w-4 h-4 mr-2' />
                          Quitar
                        </Button>
                      </div>
                    ) : (
                      <div className='space-y-2'>
                        <Upload className='w-8 h-8 mx-auto text-muted-foreground' />
                        <Button
                          variant='outline'
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Seleccionar foto
                        </Button>
                        <p className='text-xs text-muted-foreground'>
                          JPG, PNG o WEBP
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='title'>Título del trabajo</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder='Ej: Instalación eléctrica residencial'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Descripción</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder='Describe el trabajo realizado...'
                    rows={3}
                  />
                </div>

                <div className='flex gap-3'>
                  <Button
                    onClick={handleUpload}
                    disabled={
                      loading || !selectedFile || !formData.title.trim()
                    }
                    className='flex-1'
                  >
                    {loading ? "Subiendo..." : "Subir foto"}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setShowUploadDialog(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Photos grid with loading skeleton */}
      {loadingPhotos ? (
        <div className='grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-w-2xl'>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className='aspect-square bg-gray-200 animate-pulse rounded-lg'
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        isOwner ? (
          /* Empty gallery with upload slots for owner */
          <div className='grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-w-2xl'>
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                onClick={() => setShowUploadDialog(true)}
                className='aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:border-muted-foreground/50 cursor-pointer bg-white/50 transition-colors'
              >
                <div className='flex flex-col items-center gap-2'>
                  <Plus className='w-8 h-8' />
                  <span className='text-xs font-medium'>
                    {index === 0 ? 'Primera foto' : 'Agregar foto'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Message for non-owners */
          <div className='text-center py-12'>
            <div className='w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center'>
              <Upload className='w-8 h-8 text-muted-foreground' />
            </div>
            <p className='text-muted-foreground'>
              Este profesional aún no ha compartido fotos de sus trabajos.
            </p>
          </div>
        )
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={photos.map((p) => p.id)}
            strategy={rectSortingStrategy}
            disabled={!isOwner}
          >
            <div className='grid grid-cols-2 gap-2 rounded-xl overflow-hidden max-w-2xl'>
              {photos
                .slice(0, photos.length > 4 ? 3 : 4)
                .map((photo, index) => {
                  const isMainPhoto = photo.image_url === mainPortfolioImage;

                  return (
                    <SortablePhotoItem
                      key={photo.id}
                      photo={photo}
                      index={index}
                      isMainPhoto={isMainPhoto}
                      isOwner={isOwner}
                      onClick={() => handlePhotoClick(photo, index)}
                    />
                  );
                })}
              {isOwner && (
                <div
                  key='add-tile'
                  onClick={() => setShowUploadDialog(true)}
                  className='aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center text-muted-foreground hover:border-muted-foreground/50 cursor-pointer bg-white/50'
                >
                  <div className='flex flex-col items-center gap-1'>
                    <Plus className='w-6 h-6' />
                    <span className='text-xs font-medium'>Agregar foto</span>
                  </div>
                </div>
              )}
              {photos.length > 4 && (
                <div className='col-span-1 row-span-1 relative overflow-hidden group cursor-pointer aspect-square bg-gray-900 rounded-lg'>
                  <Image
                    src={photos[3].image_url}
                    alt='Más fotos'
                    fill
                    className='w-full h-full object-cover opacity-40'
                  />
                  <div
                    className='absolute inset-0 flex items-center justify-center'
                    onClick={() => handlePhotoClick(photos[3], 3)}
                  >
                    <span className='text-white font-bold text-2xl'>
                      +{photos.length - 3}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Photo Modal/Drawer - Custom fullscreen for mobile, Dialog for desktop */}
      {isMobile ? (
        showPhotoModal && selectedPhoto && (
          <div
            className='fixed top-0 left-0 right-0 bottom-0 z-[100] bg-black'
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: '100vw',
              height: '100dvh',
              overflow: 'hidden'
            }}
          >
            {/* Close button - top left */}
            <button
              onClick={() => {
                setShowPhotoModal(false);
                setShowGridView(false);
              }}
              className='fixed top-4 left-4 z-50 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors'
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>

            {/* Grid view button - top right */}
            {photos.length > 1 && !showGridView && (
              <button
                onClick={() => setShowGridView(true)}
                className='fixed top-4 right-4 z-50 w-10 h-10 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors'
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <Grid3x3 className='w-5 h-5' />
              </button>
            )}

            {/* Grid View - All photos in 2 columns */}
            {showGridView ? (
              <div
                className='fixed top-0 left-0 right-0 bottom-0 bg-black'
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100dvh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y'
                }}
              >
                <div className='grid grid-cols-2 gap-2 p-4 pt-20 pb-20 min-h-full'>
                  {photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className='aspect-square relative cursor-pointer'
                      onClick={() => {
                        setSelectedPhoto(photo);
                        setSelectedPhotoIndex(index);
                        setShowGridView(false);
                      }}
                    >
                      <Image
                        src={photo.image_url}
                        alt={photo.title}
                        fill
                        className='object-cover rounded-lg'
                        sizes='50vw'
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Single Photo View */
              <div
                className='fixed top-0 left-0 right-0 bottom-0 bg-black flex items-center justify-center'
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100vw',
                  height: '100dvh'
                }}
                onTouchStart={(e) => {
                  const touchStartX = e.touches[0].clientX;
                  const touchStartY = e.touches[0].clientY;

                  const handleTouchMove = (moveEvent: TouchEvent) => {
                    const touchEndX = moveEvent.touches[0].clientX;
                    const touchEndY = moveEvent.touches[0].clientY;
                    const diffX = touchStartX - touchEndX;
                    const diffY = touchStartY - touchEndY;

                    // Only trigger swipe if horizontal movement is greater than vertical
                    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                      if (diffX > 0) {
                        // Swipe left - next photo
                        handleNextPhoto();
                      } else {
                        // Swipe right - previous photo
                        handlePreviousPhoto();
                      }
                      document.removeEventListener('touchmove', handleTouchMove);
                      document.removeEventListener('touchend', handleTouchEnd);
                    }
                  };

                  const handleTouchEnd = () => {
                    document.removeEventListener('touchmove', handleTouchMove);
                    document.removeEventListener('touchend', handleTouchEnd);
                  };

                  document.addEventListener('touchmove', handleTouchMove, { passive: true });
                  document.addEventListener('touchend', handleTouchEnd);
                }}
              >
                <div className='relative w-full h-full'>
                  <Image
                    src={selectedPhoto.image_url}
                    alt={selectedPhoto.title}
                    fill
                    className='object-contain'
                    priority
                  />
                </div>

                {/* Photo counter - top center */}
                {photos.length > 1 && (
                  <div className='fixed top-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium z-40' style={{ backdropFilter: 'blur(8px)' }}>
                    {selectedPhotoIndex + 1} / {photos.length}
                  </div>
                )}

                {/* Details button - floating at bottom */}
                {(selectedPhoto.title || selectedPhoto.description || isOwner) && (
                  <div className='fixed bottom-0 left-0 right-0 p-4 z-40'>
                    <button
                      onClick={() => {
                        const detailsSheet = document.getElementById('photo-details-sheet');
                        const backdrop = document.getElementById('photo-details-backdrop');
                        if (detailsSheet && backdrop) {
                          detailsSheet.classList.remove('translate-y-full');
                          detailsSheet.classList.add('translate-y-0');
                          backdrop.classList.remove('bg-black/0', 'pointer-events-none');
                          backdrop.classList.add('bg-black/40', 'pointer-events-auto');
                        }
                      }}
                      className='w-full bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg'
                    >
                      <span>Ver detalles</span>
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 15l7-7 7 7' />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Backdrop for bottom sheet */}
            <div
              id='photo-details-backdrop'
              className='fixed inset-0 bg-black/0 z-29 pointer-events-none transition-colors duration-300'
              onClick={() => {
                const detailsSheet = document.getElementById('photo-details-sheet');
                const backdrop = document.getElementById('photo-details-backdrop');
                if (detailsSheet && backdrop) {
                  detailsSheet.classList.remove('translate-y-0');
                  detailsSheet.classList.add('translate-y-full');
                  backdrop.classList.remove('bg-black/40', 'pointer-events-auto');
                  backdrop.classList.add('bg-black/0', 'pointer-events-none');
                }
              }}
            />

            {/* Details Bottom Sheet */}
            <div
              id='photo-details-sheet'
              className='fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl transform translate-y-full transition-transform duration-300 z-30 max-h-[70vh] flex flex-col'
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                const sheet = e.currentTarget;
                const startY = e.touches[0].clientY;
                const startTranslate = 0;
                let currentTranslate = 0;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const currentY = moveEvent.touches[0].clientY;
                  const diff = currentY - startY;

                  // Only allow dragging down
                  if (diff > 0) {
                    currentTranslate = diff;
                    sheet.style.transform = `translateY(${diff}px)`;
                    sheet.style.transition = 'none';
                  }
                };

                const handleTouchEnd = () => {
                  sheet.style.transition = 'transform 0.3s';

                  // If dragged more than 100px, close it
                  if (currentTranslate > 100) {
                    const detailsSheet = document.getElementById('photo-details-sheet');
                    const backdrop = document.getElementById('photo-details-backdrop');
                    if (detailsSheet && backdrop) {
                      detailsSheet.classList.remove('translate-y-0');
                      detailsSheet.classList.add('translate-y-full');
                      backdrop.classList.remove('bg-black/40', 'pointer-events-auto');
                      backdrop.classList.add('bg-black/0', 'pointer-events-none');
                    }
                  } else {
                    // Snap back
                    sheet.style.transform = 'translateY(0)';
                  }

                  document.removeEventListener('touchmove', handleTouchMove);
                  document.removeEventListener('touchend', handleTouchEnd);
                };

                document.addEventListener('touchmove', handleTouchMove, { passive: true });
                document.addEventListener('touchend', handleTouchEnd);
              }}
            >
              {/* Handle - draggable area */}
              <div className='w-full flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing'>
                <div className='w-10 h-1 bg-gray-300 rounded-full' />
              </div>

              {/* Close button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowDetailsSheet(false);
                  setTimeout(() => {
                    const detailsSheet = document.getElementById('photo-details-sheet');
                    const backdrop = document.getElementById('photo-details-backdrop');
                    if (detailsSheet && backdrop) {
                      detailsSheet.classList.remove('translate-y-0');
                      detailsSheet.classList.add('translate-y-full');
                      backdrop.classList.remove('bg-black/40', 'pointer-events-auto');
                      backdrop.classList.add('bg-black/0', 'pointer-events-none');
                    }
                  }, 10);
                }}
                className='absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-50'
                type='button'
              >
                <X className='w-5 h-5' />
              </button>

              {/* Content */}
              <div className='flex-1 overflow-y-auto px-6 pb-6'>
                {/* Title and Description: owner can edit; others see if present */}
                {!isOwner && selectedPhoto.title && (
                  <div className='mb-4'>
                    <h3 className='text-2xl font-bold text-foreground'>
                      {selectedPhoto.title}
                    </h3>
                  </div>
                )}
                {/* Title and Description: owner can edit; others see if present */}
                {isOwner ? (
                  <div className='flex-1 flex flex-col space-y-3'>
                    <div className='rounded-lg bg-gray-50 border border-dashed border-gray-300 p-3 hover:border-gray-400 transition-colors'>
                      <Input
                        id='photo-title'
                        placeholder='Título del trabajo'
                        value={selectedPhoto.title}
                        onChange={(e) =>
                          setSelectedPhoto({
                            ...selectedPhoto,
                            title: e.target.value,
                          })
                        }
                        className='text-lg font-semibold border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent'
                      />
                    </div>

                    <div className='rounded-lg bg-gray-50 border border-dashed border-gray-300 p-3 hover:border-gray-400 transition-colors flex-1 flex'>
                      <Textarea
                        id='photo-description'
                        className='flex-1 min-h-[100px] resize-none border-0 px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 bg-transparent'
                        placeholder='Descripción del trabajo (opcional)'
                        value={selectedPhoto.description || ""}
                        onChange={(e) =>
                          setSelectedPhoto({
                            ...selectedPhoto,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  selectedPhoto.description &&
                  selectedPhoto.description.trim() && (
                    <div className='bg-white border border-gray-200 rounded-2xl p-6 mb-6 flex-1 overflow-auto'>
                      <p className='text-muted-foreground leading-relaxed text-lg'>
                        {selectedPhoto.description}
                      </p>
                    </div>
                  )
                )}

                {/* Action Buttons - Only visible to owner */}
                {isOwner && (
                  <div className='mt-auto space-y-2 pt-3 border-t border-gray-100'>
                    <LoadingButton
                      size='sm'
                      className='w-full'
                      loading={isSaving}
                      loadingText='Guardando'
                      onClick={async () => {
                        try {
                          setIsSaving(true);
                          await updatePortfolioPhoto(
                            selectedPhoto.id,
                            selectedPhoto.title,
                            selectedPhoto.description || ""
                          );
                          await loadPhotos();
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                    >
                      Guardar cambios
                    </LoadingButton>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full justify-start gap-2 text-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                      onClick={() => {
                        handleSetAsMain(selectedPhoto);
                        setShowPhotoModal(false);
                      }}
                    >
                      <Star className='w-4 h-4 text-blue-600' />
                      <span>Imagen principal</span>
                    </Button>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full justify-start gap-2 text-sm border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700'
                      onClick={() => {
                        setShowPhotoModal(false);
                        handleDelete(selectedPhoto);
                      }}
                    >
                      <Trash2 className='w-4 h-4' />
                      <span>Eliminar</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
        <Dialog open={showPhotoModal} onOpenChange={setShowPhotoModal}>
          <DialogContent className='p-0 w-screen h-screen max-w-none rounded-none overflow-hidden bg-white'>
            <VisuallyHidden>
              <DialogTitle>Galería de fotos</DialogTitle>
            </VisuallyHidden>
            {selectedPhoto && (
              <div className='h-full flex flex-col'>
                {/* Header with close button */}
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
                  <button
                    onClick={() => setShowPhotoModal(false)}
                    className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                  >
                    <X className='w-6 h-6' />
                  </button>
                  {photos.length > 1 && (
                    <div className='text-sm font-medium text-gray-600'>
                      {selectedPhotoIndex + 1} / {photos.length}
                    </div>
                  )}
                  <div className='w-10' /> {/* Spacer for centering */}
                </div>

                {/* Main content area */}
                <div className='flex-1 flex overflow-hidden'>
                  {/* Left side - Image (70%) */}
                  <div className='flex-[7] relative bg-white flex items-center justify-center p-8'>
                    {/* Navigation buttons */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousPhoto}
                          className='absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 border border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all z-10'
                        >
                          <ChevronLeft className='w-6 h-6' />
                        </button>
                        <button
                          onClick={handleNextPhoto}
                          className='absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-50 border border-gray-300 rounded-full flex items-center justify-center shadow-lg transition-all z-10'
                        >
                          <ChevronRight className='w-6 h-6' />
                        </button>
                      </>
                    )}

                    {/* Image - centered and contained */}
                    <div className='relative w-full h-full'>
                      <Image
                        src={selectedPhoto.image_url}
                        alt={selectedPhoto.title}
                        fill
                        className='object-contain'
                        quality={100}
                        priority
                      />
                    </div>
                  </div>

                  {/* Right side - Details (30%) */}
                  <div className='flex-[3] border-l border-gray-200 flex flex-col bg-white overflow-y-auto'>
                    <div className='p-6 flex flex-col h-full'>
                      {/* Title */}
                      {isOwner ? (
                        <div className='mb-4'>
                          <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                            Título del trabajo
                          </Label>
                          <Input
                            id='photo-title-desktop'
                            placeholder='Título del trabajo'
                            value={selectedPhoto.title}
                            onChange={(e) =>
                              setSelectedPhoto({
                                ...selectedPhoto,
                                title: e.target.value,
                              })
                            }
                            className='text-xl font-semibold'
                          />
                        </div>
                      ) : (
                        selectedPhoto.title && (
                          <div className='mb-4'>
                            <h2 className='text-2xl font-bold text-gray-900'>
                              {selectedPhoto.title}
                            </h2>
                          </div>
                        )
                      )}

                      {/* Description */}
                      {isOwner ? (
                        <div className='flex-1 mb-4'>
                          <Label className='text-sm font-medium text-gray-700 mb-2 block'>
                            Descripción
                          </Label>
                          <Textarea
                            id='photo-description-desktop'
                            className='min-h-[200px] resize-none'
                            placeholder='Descripción del trabajo (opcional)'
                            value={selectedPhoto.description || ""}
                            onChange={(e) =>
                              setSelectedPhoto({
                                ...selectedPhoto,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                      ) : (
                        selectedPhoto.description &&
                        selectedPhoto.description.trim() && (
                          <div className='flex-1 mb-4'>
                            <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                              {selectedPhoto.description}
                            </p>
                          </div>
                        )
                      )}

                      {/* Action buttons - only for owner */}
                      {isOwner && (
                        <div className='mt-auto space-y-3 pt-4 border-t border-gray-200'>
                          <LoadingButton
                            loading={isSaving}
                            loadingText='Guardando'
                            className='w-full'
                            onClick={async () => {
                              try {
                                setIsSaving(true);
                                await updatePortfolioPhoto(
                                  selectedPhoto.id,
                                  selectedPhoto.title,
                                  selectedPhoto.description || ""
                                );
                                await loadPhotos();
                              } finally {
                                setIsSaving(false);
                              }
                            }}
                          >
                            Guardar cambios
                          </LoadingButton>
                          <LoadingButton
                            onClick={() => handleSetAsMain(selectedPhoto)}
                            variant='outline'
                            className='w-full flex items-center justify-center gap-2'
                            loading={isSettingMain}
                            loadingText='Estableciendo'
                          >
                            <Star className='w-4 h-4' />
                            <span>Establecer como principal</span>
                          </LoadingButton>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant='outline'
                                className='w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200'
                              >
                                <Trash2 className='w-4 h-4' />
                                <span>Eliminar foto</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  ¿Eliminar esta foto?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={async () => {
                                    const { success } = await deletePortfolioPhoto(
                                      selectedPhoto.id,
                                      selectedPhoto.image_url
                                    );
                                    if (success) {
                                      setShowPhotoModal(false);
                                      loadPhotos();
                                    }
                                  }}
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
