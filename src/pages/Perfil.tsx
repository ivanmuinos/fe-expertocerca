"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, User, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EditableAvatar } from '@/components/EditableAvatar';
import { SharedHeader } from '@/components/SharedHeader';

export default function Perfil() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getProfile, getProfessionalProfile, loading } = useProfiles();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<any>(null);
  const [professionalData, setProfessionalData] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    whatsapp_phone: '',
    bio: '',
    location_city: '',
    location_province: '',
    avatar_url: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    const [profileResult, professionalResult] = await Promise.all([
      getProfile(user.id),
      getProfessionalProfile(user.id)
    ]);

    if (profileResult.data) {
      setProfileData(profileResult.data);
      setFormData({
        full_name: profileResult.data.full_name || '',
        phone: profileResult.data.phone || '',
        whatsapp_phone: profileResult.data.whatsapp_phone || '',
        bio: profileResult.data.bio || '',
        location_city: profileResult.data.location_city || '',
        location_province: profileResult.data.location_province || '',
        avatar_url: profileResult.data.avatar_url || ''
      });
    }

    if (professionalResult.data) {
      setProfessionalData(professionalResult.data);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Update profile data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          whatsapp_phone: formData.whatsapp_phone,
          bio: formData.bio,
          location_city: formData.location_city,
          location_province: formData.location_province,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // If user has professional profile, update WhatsApp there too
      if (professionalData) {
        await supabase
          .from('professional_profiles')
          .update({
            whatsapp_phone: formData.whatsapp_phone,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }

      toast({
        title: "¡Perfil actualizado!",
        description: "Tu información ha sido guardada exitosamente",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar tu perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="container mx-auto max-w-2xl text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acceso denegado</h1>
          <p className="text-muted-foreground mb-6">Necesitas iniciar sesión para ver tu perfil</p>
          <Button onClick={() => navigate('/auth')}>
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader showBackButton={true} title="Mi Perfil" />

      {/* Content */}
      <div className="px-4 py-8 sm:py-12">
        <div className="container mx-auto max-w-2xl">
          <Card className="shadow-xl">
            <CardHeader className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl sm:text-3xl">Configuración del Perfil</CardTitle>
              </div>
              <p className="text-muted-foreground">
                Actualiza tu información personal y de contacto
              </p>
            </CardHeader>
            
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Avatar Section */}
              <div className="text-center">
                <EditableAvatar
                  avatarUrl={formData.avatar_url}
                  userFullName={formData.full_name}
                  size="lg"
                  onAvatarChange={(newUrl) => setFormData({ ...formData, avatar_url: newUrl || '' })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp_phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp_phone"
                  value={formData.whatsapp_phone}
                  onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                  placeholder="Ej: +54 9 11 1234-5678"
                  className="font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Incluye código de país. Este número se usará para contactarte por WhatsApp.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_city">Ciudad</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                  placeholder="Tu ciudad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_province">Provincia</Label>
                <Input
                  id="location_province"
                  value={formData.location_province}
                  onChange={(e) => setFormData({ ...formData, location_province: e.target.value })}
                  placeholder="Tu provincia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Cuéntanos sobre ti..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}