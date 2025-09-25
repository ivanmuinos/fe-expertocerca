"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/shared/components/ui/dialog';
import { usePortfolio, type PortfolioPhoto } from '@/src/features/user-profile';
import { useAuthState } from '@/src/features/auth'

interface PortfolioSectionProps {
  professionalProfileId: string;
  isOwner: boolean;
}

export function PortfolioSection({ professionalProfileId, isOwner }: PortfolioSectionProps) {
  const { user, loading: authLoading } = useAuthState();
  const { getPortfolioPhotos, uploadPortfolioPhoto, deletePortfolioPhoto, loading } = usePortfolio();
  const [photos, setPhotos] = useState<PortfolioPhoto[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = useCallback(async () => {
    const { data } = await getPortfolioPhotos(professionalProfileId);
    if (data) {
      setPhotos(data);
    }
  }, [getPortfolioPhotos, professionalProfileId]);

  useEffect(() => {
    loadPhotos();
  }, [professionalProfileId]);

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

  const handleDelete = async (photo: PortfolioPhoto) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta foto?')) {
      const { success } = await deletePortfolioPhoto(photo.id, photo.image_url);
      if (success) {
        loadPhotos();
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '' });
    setSelectedFile(null);
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

      {/* Photos grid - Airbnb style */}
      {photos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            {isOwner 
              ? 'Aún no has subido fotos de tus trabajos. ¡Comparte tu experiencia!' 
              : 'Este profesional aún no ha compartido fotos de sus trabajos.'
            }
          </p>
        </div>
      ) : (
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
              <div key={photo.id} className={`relative overflow-hidden group cursor-pointer ${gridClass}`}>
                <Image
                  src={photo.image_url}
                  alt={photo.title}
                  fill
                  sizes={isMainPhoto ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  priority={index === 0}
                />
                {index === 4 && photos.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{photos.length - 5}</span>
                  </div>
                )}
                {isOwner && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      )}
      
      {/* Show photo details below grid */}
      {photos.length > 0 && (
        <div className="mt-6 space-y-4">
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

    </div>
  );
}