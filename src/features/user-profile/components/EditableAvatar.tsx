import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/components/ui/avatar';
import { Button } from '@/src/shared/components/ui/button';
import { Camera, Upload, User } from 'lucide-react';
import { useAuthState } from '@/src/features/auth'
import { supabase } from '@/src/config/supabase';
import { useToast } from '@/src/shared/hooks/use-toast';

interface EditableAvatarProps {
  avatarUrl?: string | null;
  userFullName?: string;
  size?: 'sm' | 'md' | 'lg';
  onAvatarChange?: (newUrl: string | null) => void;
  showUploadButton?: boolean;
  isOwner?: boolean; // Nueva prop para indicar si es el propietario del perfil
}

export function EditableAvatar({ 
  avatarUrl, 
  userFullName = '', 
  size = 'md',
  onAvatarChange,
  showUploadButton = true,
  isOwner = false
}: EditableAvatarProps) {
  const { user, loading } = useAuthState();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Get Google avatar from user metadata as fallback, but only for owner
  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const displayAvatar = avatarUrl || (isOwner ? googleAvatar : null);
  
  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-20 w-20',
    lg: 'h-32 w-32'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error", 
        description: "La imagen es muy grande. Máximo 5MB permitido",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('portfolio')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('portfolio')
        .getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

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
    }
  };

  const handleUseGoogleAvatar = async () => {
    if (!user || !googleAvatar) return;

    setUploading(true);
    try {
      // Update profile to use Google avatar
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: googleAvatar,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      onAvatarChange?.(googleAvatar);

      toast({
        title: "Avatar actualizado",
        description: "Ahora usas tu foto de Google como avatar",
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar el avatar",
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
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

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
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={displayAvatar || undefined} 
            alt={`${userFullName}'s avatar`} 
          />
          <AvatarFallback className="text-lg font-medium">
            {userFullName ? getInitials(userFullName) : <User className={iconSizes[size]} />}
          </AvatarFallback>
        </Avatar>
        
        {showUploadButton && (
          <Button
            size="sm"
            variant="outline"
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0 border-2 border-background"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showUploadButton && (
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Subiendo...' : 'Subir foto'}
          </Button>
          
          {googleAvatar && googleAvatar !== avatarUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUseGoogleAvatar}
              disabled={uploading}
            >
              Usar foto de Google
            </Button>
          )}
          
          {displayAvatar && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveAvatar}
              disabled={uploading}
            >
              Remover
            </Button>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}