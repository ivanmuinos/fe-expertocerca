"use client";

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { useAuthState, useAuthActions } from '@/src/features/auth'
import { useProfiles } from '@/src/features/user-profile';
import { supabase } from '@/src/config/supabase';
import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Save, User, Phone, LogOut } from 'lucide-react';
import { useToast } from '@/src/shared/hooks/use-toast';
import { EditableAvatar } from '@/src/shared/components/EditableAvatar';
import { SharedHeader } from '@/src/shared/components/SharedHeader';
import { Footer } from '@/src/shared/components/Footer';

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthState();
  const { signOut } = useAuthActions();
  const { getProfile, getProfessionalProfile, loading: profilesLoading } = useProfiles();
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

  const loadUserData = useCallback(async () => {
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
  }, [user, getProfile, getProfessionalProfile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?next=/perfil");
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user?.id, authLoading, navigate]); // Only depend on user.id to avoid infinite loops

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
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al actualizar tu perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <SharedHeader showBackButton={true} title="Mi Perfil" variant="transparent" />

        {/* Skeleton Loading - Airbnb Style Layout */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[calc(100vh-120px)]">

            {/* Left Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-32">
                <div className="h-9 bg-gray-200 rounded-lg mb-8 w-20 animate-pulse"></div>
                <div className="space-y-1">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Right Content Skeleton */}
            <div className="lg:col-span-3 space-y-8">

              {/* Header Skeleton */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                </div>

                {/* Profile Card Skeleton */}
                <div className="p-8 border border-gray-200 rounded-2xl shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Left: Avatar and Basic Info Skeleton */}
                    <div className="text-center md:text-left">
                      <div className="flex flex-col items-center md:items-start space-y-4">
                        <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-7 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                          <div className="h-5 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
                        </div>
                      </div>

                      {/* Verified Badge Skeleton */}
                      <div className="mt-6 flex items-center justify-center md:justify-start">
                        <div className="h-5 bg-gray-200 rounded-lg w-36 animate-pulse"></div>
                      </div>
                    </div>

                    {/* Right: Stats Skeleton */}
                    <div className="grid grid-cols-3 gap-4 h-fit">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="text-center">
                          <div className="h-8 bg-gray-200 rounded-lg mb-1 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded-lg animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info Skeleton */}
              <div className="p-6 border border-gray-200 rounded-2xl shadow-sm">
                <div className="h-6 bg-gray-200 rounded-lg w-48 mb-4 animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 bg-gray-200 rounded-lg w-40 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews Section Skeleton */}
              <div>
                <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="p-6 border border-gray-200 rounded-2xl shadow-sm">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 animate-pulse"></div>
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                          <div className="space-y-1">
                            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Skeleton */}
        <div className="bg-gray-100 mt-16">
          <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SharedHeader showBackButton={true} title="Mi Perfil" variant="transparent" />

      {/* Main Content - Airbnb Style Layout */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-[calc(100vh-120px)]">

          {/* Left Sidebar - Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <h1 className="text-3xl font-semibold text-gray-900 mb-8">Perfil</h1>

              <nav className="space-y-1">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 text-gray-900 font-medium">
                  Sobre mi
                </button>
                {/* Preparado para más opciones */}
              </nav>
            </div>
          </div>

          {/* Right Content - Main Section */}
          <div className="lg:col-span-3 space-y-8">

            {/* About Me Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Sobre mi</h2>
                <Button variant="outline" className="rounded-lg">
                  Editar
                </Button>
              </div>

              {/* Profile Card */}
              <Card className="p-8 border border-gray-200 rounded-2xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Left: Avatar and Basic Info */}
                  <div className="text-center md:text-left">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                      <EditableAvatar
                        avatarUrl={formData.avatar_url}
                        userFullName={formData.full_name}
                        size="xl"
                        onAvatarChange={(newUrl) => setFormData({ ...formData, avatar_url: newUrl || '' })}
                      />
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900">
                          {formData.full_name || 'Tu nombre'}
                        </h3>
                        <p className="text-gray-600">
                          {formData.location_city && formData.location_province
                            ? `${formData.location_city}, ${formData.location_province}`
                            : 'Ubicación no especificada'
                          }
                        </p>
                      </div>
                    </div>

                    {/* Verified Badge */}
                    <div className="mt-6 flex items-center justify-center md:justify-start">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">Identidad verificada</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Stats */}
                  <div className="grid grid-cols-3 gap-4 h-fit">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">5</div>
                      <div className="text-sm text-gray-600">Trabajos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">4.8</div>
                      <div className="text-sm text-gray-600">Evaluaciones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">2</div>
                      <div className="text-sm text-gray-600">Años en Experto Cerca</div>
                    </div>
                  </div>
                </div>

                {/* Bio Section */}
                {formData.bio && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{formData.bio}</p>
                  </div>
                )}
              </Card>
            </div>

            {/* Contact Info Section */}
            <Card className="p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de contacto</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {formData.whatsapp_phone || 'WhatsApp no configurado'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700">
                    {formData.phone || 'Teléfono no configurado'}
                  </span>
                </div>
              </div>
            </Card>

            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis evaluaciones</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock reviews - reemplazar con datos reales */}
                {[1, 2, 3].map((review) => (
                  <Card key={review} className="p-6 border border-gray-200 rounded-2xl shadow-sm">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900">Cliente {review}</h4>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">febrero de 2025</p>
                        <p className="text-sm text-gray-700">
                          Excelente trabajo, muy profesional y puntual. Lo recomiendo completamente.
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Logout Section - Mobile */}
            <div className="md:hidden">
              <Card className="p-6 border border-gray-200 rounded-2xl shadow-sm">
                <Button
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                  variant="outline"
                  className="w-full justify-start gap-3 h-12 text-base border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar sesión</span>
                </Button>
              </Card>
            </div>

            {/* Edit Modal/Form (Hidden by default) */}
            <div className="hidden">
              <Card className="p-8 border border-gray-200 rounded-2xl shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Editar perfil</h3>

                <div className="space-y-6">
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
                      disabled={saving || profilesLoading}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? 'Guardando...' : 'Guardar cambios'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}