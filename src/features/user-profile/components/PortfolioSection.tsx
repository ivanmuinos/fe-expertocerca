import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Edit2, Trash2, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/shared/components/ui/dialog';
import { usePortfolio, type PortfolioPhoto } from '@/src/features/user-profile';
import { useAuthState } from '@/src/features/auth';
import useEmblaCarousel from 'embla-carousel-react';

interface PortfolioSectionProps {
  professionalProfileId: string;
  isOwner: boolean;
}

export function PortfolioSection({ professionalProfileId, isOwner }: PortfolioSectionProps) {
  const { user, loading: authLoading } = useAuthState();
  const { getPortfolioPhotos, uploadPortfolioPhoto, updatePortfolioPhoto, deletePortfolioPhoto, loading } = usePortfolio();
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<PortfolioPhoto | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Embla carousel for mobile
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    skipSnaps: false,
    dragFree: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const loadPhotos = useCallback(async () => {
    const { data } = await getPortfolioPhotos(professionalProfileId);
    if (data) {
      setPhotos(data);
    }
  }, [getPortfolioPhotos, professionalProfileId]);

  useEffect(() => {
    loadPhotos();
  }, [professionalProfileId]);

  // Update selected index when carousel scrolls
  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Por favor selecciona solo archivos de imagen');
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
        file: selectedFile
      },
      user.id
    );

    if (success) {
      setShowUploadDialog(false);
      setSelectedFile(null);
      setFormData({ title: '', description: '' });
      loadPhotos();
    }
  };

  const handleEdit = async () => {
    if (!editingPhoto) return;

    const { success } = await updatePortfolioPhoto(
      editingPhoto.id,
      formData.title,
      formData.description
    );

    if (success) {
      setEditingPhoto(null);
      setFormData({ title: '', description: '' });
      loadPhotos();
    }
  };

  const handleDelete = async (photo: PortfolioPhoto) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      const { success } = await deletePortfolioPhoto(photo.id, photo.image_url);
      if (success) {
        loadPhotos();
      }
    }
  };

  const openEditDialog = (photo: PortfolioPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      title: photo.title,
      description: photo.description || ''
    });
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setSelectedFile(null);
    setEditingPhoto(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with upload button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Trabajos realizados</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {photos.length === 0 
              ? 'Aún no hay trabajos en el portafolio' 
              : `${photos.length} ${photos.length === 1 ? 'trabajo' : 'trabajos'} realizados`
            }
          </p>
        </div>
        
        {isOwner && (
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Agregar foto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Subir nueva foto</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Foto del trabajo</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="space-y-2">
                        <Image
                          src={URL.createObjectURL(selectedFile)}
                          alt="Preview"
                          width={400}
                          height={128}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">{selectedFile.name}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Quitar
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Seleccionar foto
                        </Button>
                        <p className="text-xs text-muted-foreground">JPG, PNG o WEBP</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título del trabajo</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Instalación eléctrica residencial"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe el trabajo realizado..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={handleUpload}
                    disabled={loading || !selectedFile || !formData.title.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Subiendo...' : 'Subir foto'}
                  </Button>
                  <Button 
                    variant="outline" 
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

      {/* Photos - Mobile Carousel / Desktop Grid */}
      {photos.length === 0 ? (
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
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Este profesional aún no ha compartido fotos de sus trabajos.
            </p>
          </div>
        )
      ) : (
        <>
          {/* Mobile Carousel */}
          <div className="lg:hidden">
            <div className="relative">
              <div className="overflow-hidden rounded-xl" ref={emblaRef}>
                <div className="flex">
                  {photos.map((photo, index) => (
                    <div key={photo.id} className="flex-[0_0_100%] min-w-0">
                      <div className="relative aspect-[4/3] bg-gray-100">
                        <Image
                          src={photo.image_url}
                          alt={photo.title}
                          fill
                          sizes="100vw"
                          className="object-cover"
                          priority={index < 2}
                          loading={index < 2 ? "eager" : "lazy"}
                        />
                        {isOwner && (
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => openEditDialog(photo)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(photo)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={scrollPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                    disabled={selectedIndex === 0}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                    disabled={selectedIndex === photos.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Dots Indicator */}
              {photos.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => emblaApi?.scrollTo(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === selectedIndex
                          ? 'w-6 bg-primary'
                          : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Counter */}
              {photos.length > 1 && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {selectedIndex + 1} / {photos.length}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 grid-rows-2 gap-2 h-96 rounded-xl overflow-hidden">
              {photos.map((photo, index) => {
                const isMainPhoto = index === 0;
                const gridClass = isMainPhoto 
                  ? "col-span-2 row-span-2" 
                  : index === 1 
                    ? "col-span-1 row-span-1" 
                    : index === 2 
                      ? "col-span-1 row-span-1" 
                      : index === 3 
                        ? "col-span-1 row-span-1" 
                        : index === 4 
                          ? "col-span-1 row-span-1" 
                          : "hidden";
                
                if (index > 4) return null;
                
                return (
                  <div key={photo.id} className={`relative overflow-hidden group cursor-pointer bg-gray-100 ${gridClass}`}>
                    <Image
                      src={photo.image_url}
                      alt={photo.title}
                      fill
                      sizes={isMainPhoto ? "50vw" : "25vw"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      priority={index < 3}
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                    {index === 4 && photos.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">+{photos.length - 5}</span>
                      </div>
                    )}
                    {isOwner && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditDialog(photo)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(photo)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      
      {/* Show photo details below grid - Hidden on mobile */}
      {photos.length > 0 && (
        <div className="mt-6 space-y-4 hidden lg:block">
          {photos.slice(0, 3).map((photo) => (
            <div key={photo.id} className="border-b border-border pb-4 last:border-b-0">
              <h4 className="font-medium text-foreground">{photo.title}</h4>
              {photo.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {photo.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(photo.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {photos.length > 3 && (
            <Button variant="outline" className="w-full">
              Ver todos los trabajos ({photos.length})
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingPhoto} onOpenChange={(open) => !open && setEditingPhoto(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar información</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título del trabajo</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Título del trabajo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del trabajo"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleEdit}
                disabled={loading || !formData.title.trim()}
                className="flex-1"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setEditingPhoto(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}