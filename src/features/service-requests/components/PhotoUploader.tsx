"use client";

import { useState } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/src/shared/components/ui/button';
import { useMobile } from '@/src/shared/components/MobileWrapper';
import Image from 'next/image';

interface PhotoUploaderProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUploader({ photos, onPhotosChange, maxPhotos = 5 }: PhotoUploaderProps) {
  const { isMobile } = useMobile();
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > maxPhotos) {
      alert(`Máximo ${maxPhotos} fotos permitidas`);
      return;
    }

    const newPhotos = [...photos, ...files];
    onPhotosChange(newPhotos);

    // Generate previews
    const newPreviews = await Promise.all(
      files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      })
    );
    setPreviews([...previews, ...newPreviews]);
  };

  const handleCameraCapture = async () => {
    try {
      // Dynamic import for Capacitor Camera
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
      });

      if (image.webPath) {
        // Convert to File
        const response = await fetch(image.webPath);
        const blob = await response.blob();
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        const newPhotos = [...photos, file];
        onPhotosChange(newPhotos);
        setPreviews([...previews, image.webPath]);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <label className="w-full">
          <Button
            type="button"
            variant="outline"
            disabled={photos.length >= maxPhotos}
            className="w-full"
            asChild
          >
            <span>
              <Camera className="w-4 h-4 mr-2" />
              Agregar Foto
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={photos.length >= maxPhotos}
          />
        </label>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
              <Image
                src={preview}
                alt={`Preview ${index + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        {photos.length}/{maxPhotos} fotos • Opcional
      </p>
    </div>
  );
}
