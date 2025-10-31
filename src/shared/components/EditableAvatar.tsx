"use client";

import { useState, useRef } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import { Button } from "@/src/shared/components/ui/button";
import { Camera, Upload, User } from "lucide-react";
import { useAuthState } from "@/src/features/auth";
import { supabase } from "@/src/config/supabase";
import { useToast } from "@/src/shared/hooks/use-toast";
import { ImageCropModal } from "@/src/shared/components/ImageCropModal";

interface EditableAvatarProps {
  avatarUrl?: string | null;
  userFullName?: string;
  size?: "sm" | "md" | "lg";
  onAvatarChange?: (newUrl: string | null) => void;
  showUploadButton?: boolean;
  isOwner?: boolean; // Nueva prop para indicar si es el propietario del perfil
  fallbackAvatarUrl?: string | null; // Avatar alternativo (ej: Google avatar del profesional)
}

export function EditableAvatar({
  avatarUrl,
  userFullName = "",
  size = "md",
  onAvatarChange,
  showUploadButton = true,
  isOwner = false,
  fallbackAvatarUrl = null,
}: EditableAvatarProps) {
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  // Get Google avatar from user metadata as fallback for owner, or use provided fallback
  const googleAvatar =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayAvatar =
    avatarUrl || (isOwner ? googleAvatar : null) || fallbackAvatarUrl;

  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-32 w-32",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB before compression)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen es muy grande. Máximo 10MB permitido",
        variant: "destructive",
      });
      return;
    }

    // Open crop modal
    setSelectedFile(file);
    setShowCropModal(true);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    if (!user) return;

    setUploading(true);
    try {
      // Compress image before upload
      const compressedFile = await compressImage(croppedFile);

      // Upload via server API
      const formData = new FormData();
      formData.append("file", compressedFile);
      const res = await fetch("/api/profiles/avatar", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Upload failed");
      }
      
      const { url: publicUrl } = await res.json();

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Call callback to update parent component
      onAvatarChange?.(publicUrl);

      toast({
        title: "¡Avatar actualizado!",
        description: "Tu foto de perfil ha sido actualizada exitosamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  // Compress image function (same as onboarding)
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const MAX_SIZE = 1024; // Max dimension for avatar
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Calculate new dimensions
          let width = img.width;
          let height = img.height;

          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = (height / width) * MAX_SIZE;
              width = MAX_SIZE;
            } else {
              width = (width / height) * MAX_SIZE;
              height = MAX_SIZE;
            }
          }

          // Create canvas and compress
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Could not create blob'));
                return;
              }

              const newFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });

              resolve(newFile);
            },
            'image/jpeg',
            0.85 // Quality
          );
        };

        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };

      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleUseGoogleAvatar = async () => {
    if (!user || !googleAvatar) return;

    setUploading(true);
    try {
      // Update profile to use Google avatar
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: googleAvatar,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      onAvatarChange?.(googleAvatar);

      toast({
        title: "Avatar actualizado",
        description: "Ahora usas tu foto de Google como avatar",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Hubo un problema al actualizar el avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    setUploading(true);
    try {
      // Remove avatar URL from profile
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      onAvatarChange?.(null);

      toast({
        title: "Avatar removido",
        description: "Tu foto de perfil ha sido removida",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al remover el avatar",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className='flex flex-col items-center space-y-4'>
      <div className='relative'>
        <Avatar className={sizeClasses[size]}>
          <AvatarImage
            src={displayAvatar || undefined}
            alt={`${userFullName}'s avatar`}
            loading="eager"
          />
          <AvatarFallback className='text-lg font-medium'>
            {userFullName ? (
              getInitials(userFullName)
            ) : (
              <User className={iconSizes[size]} />
            )}
          </AvatarFallback>
        </Avatar>

        {showUploadButton && (
          <Button
            size='sm'
            variant='outline'
            className='absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 border-2 border-background'
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className='h-3 w-3' />
          </Button>
        )}
      </div>

      {showUploadButton && (
        <div className='flex flex-wrap gap-2 justify-center'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className='h-4 w-4 mr-2' />
            {uploading ? "Subiendo..." : "Subir foto"}
          </Button>

          {googleAvatar && googleAvatar !== avatarUrl && (
            <Button
              variant='outline'
              size='sm'
              onClick={handleUseGoogleAvatar}
              disabled={uploading}
            >
              Usar foto de Google
            </Button>
          )}
        </div>
      )}

      <input
        type='file'
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept='image/*'
        className='hidden'
      />

      {/* Crop Modal */}
      <ImageCropModal
        open={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setSelectedFile(null);
        }}
        imageFile={selectedFile}
        onCropComplete={handleCropComplete}
        aspectRatio={1}
      />
    </div>
  );
}
