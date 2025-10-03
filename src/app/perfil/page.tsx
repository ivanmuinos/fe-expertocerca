"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { useAuthState, useAuthActions } from '@/src/features/auth';
import { supabase } from '@/src/config/supabase';
import { Button } from '@/src/shared/components/ui/button';
import { Card } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Save, LogOut, MapPin, Phone, Edit2, X } from 'lucide-react';
import { useToast } from '@/src/shared/hooks/use-toast';
import { EditableAvatar } from '@/src/shared/components/EditableAvatar';
import { SharedHeader } from '@/src/shared/components/SharedHeader';
import { Footer } from '@/src/shared/components/Footer';

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthState();
  const { signOut } = useAuthActions();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    whatsapp_phone: '',
    bio: '',
    location_city: '',
    location_province: '',
    avatar_url: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?next=/perfil");
    }
  }, [user, authLoading, navigate]);

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          whatsapp_phone: data.whatsapp_phone || '',
          bio: (data as any).bio || '',
          location_city: data.location_city || '',
          location_province: data.location_province || '',
          avatar_url: data.avatar_url || ''
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar tu perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
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
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "¡Perfil actualizado!",
        description: "Tu información ha sido guardada exitosamente",
      });

      setIsEditing(false);
      loadProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar tu perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <SharedHeader variant="transparent" />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48" />
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-muted rounded-full" />
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-muted rounded w-48" />
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-4 bg-muted rounded w-64" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader variant="transparent" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        {/* Profile Card */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <EditableAvatar
                avatarUrl={formData.avatar_url}
                userFullName={formData.full_name}
                size="lg"
                onAvatarChange={(newUrl) => {
                  setFormData({ ...formData, avatar_url: newUrl || '' });
                  // Auto-save avatar
                  if (user) {
                    supabase
                      .from('profiles')
                      .update({ avatar_url: newUrl })
                      .eq('id', user.id);
                  }
                }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nombre completo</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Biografía</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Cuéntanos sobre ti..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location_city">Ciudad</Label>
                      <Input
                        id="location_city"
                        value={formData.location_city}
                        onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                        placeholder="Tu ciudad"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location_province">Provincia</Label>
                      <Input
                        id="location_province"
                        value={formData.location_province}
                        onChange={(e) => setFormData({ ...formData, location_province: e.target.value })}
                        placeholder="Tu provincia"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Tu número de teléfono"
                    />
                  </div>

                  <div>
                    <Label htmlFor="whatsapp_phone">WhatsApp</Label>
                    <Input
                      id="whatsapp_phone"
                      value={formData.whatsapp_phone}
                      onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                      placeholder="Ej: +54 9 11 1234-5678"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                    <Button onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }} variant="outline">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-semibold">{formData.full_name || 'Sin nombre'}</h2>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>

                  {formData.bio && (
                    <p className="text-sm text-muted-foreground">{formData.bio}</p>
                  )}

                  <div className="space-y-2 text-sm">
                    {(formData.location_city || formData.location_province) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {formData.location_city && formData.location_province
                            ? `${formData.location_city}, ${formData.location_province}`
                            : formData.location_city || formData.location_province}
                        </span>
                      </div>
                    )}

                    {formData.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>{formData.phone}</span>
                      </div>
                    )}

                    {formData.whatsapp_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        <span>WhatsApp: {formData.whatsapp_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Logout Button - Mobile Only */}
        <div className="md:hidden">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-3 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
