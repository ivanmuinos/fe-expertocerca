"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useAuthState, useAuthActions } from "@/src/features/auth";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Save, LogOut, MapPin, Phone, Edit2, X } from "lucide-react";
import { useToast } from "@/src/shared/hooks/use-toast";
import { EditableAvatar } from "@/src/shared/components/EditableAvatar";
import { SharedHeader } from "@/src/shared/components/SharedHeader";
import { Footer } from "@/src/shared/components/Footer";

export default function PerfilPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuthState();
  const { signOut } = useAuthActions();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    whatsapp_phone: "",
    bio: "",
    location_city: "",
    location_province: "",
    avatar_url: "",
  });

  // No client-side redirect; handled by middleware

  // Load user profile
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar perfil");
      }

      const { data } = await response.json();
      if (data) {
        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          whatsapp_phone: data.whatsapp_phone || "",
          bio: "",
          location_city: data.location_city || "",
          location_province: data.location_province || "",
          avatar_url: data.avatar_url || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar tu perfil",
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
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          whatsapp_phone: formData.whatsapp_phone,
          avatar_url: formData.avatar_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar perfil");
      }

      await loadProfile();
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se guardaron correctamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "Hubo un problema al actualizar tu perfil",
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
      <div className='min-h-screen bg-background'>
        <SharedHeader variant='transparent' showBackButton={true} />
        <div className='max-w-4xl mx-auto px-4 py-8'>
          <div className='animate-pulse space-y-6'>
            <div className='h-8 bg-muted rounded w-48' />
            <Card className='p-6'>
              <div className='flex items-start gap-6'>
                <div className='w-24 h-24 bg-muted rounded-full' />
                <div className='flex-1 space-y-4'>
                  <div className='h-6 bg-muted rounded w-48' />
                  <div className='h-4 bg-muted rounded w-32' />
                  <div className='h-4 bg-muted rounded w-64' />
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
    <div className='min-h-screen bg-background'>
      <SharedHeader variant='transparent' showBackButton={true} />

      <div className='max-w-4xl mx-auto px-4 py-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-3xl font-bold'>Mi Perfil</h1>
        </div>

        {/* Profile Card */}
        <Card className='p-6 mb-6'>
          <div className='flex flex-col md:flex-row items-start gap-6'>
            {/* Avatar */}
            <div className='flex-shrink-0'>
              <EditableAvatar
                avatarUrl={formData.avatar_url}
                userFullName={formData.full_name}
                size='lg'
                onAvatarChange={async (newUrl) => {
                  setFormData({ ...formData, avatar_url: newUrl || "" });
                  // Auto-save avatar via server-side API
                  if (user && newUrl) {
                    try {
                      await fetch("/api/profile", {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ avatar_url: newUrl }),
                      });
                    } catch (error) {
                      console.error("Error saving avatar:", error);
                    }
                  }
                }}
              />
            </div>

            {/* Info */}
            <div className='flex-1 w-full'>
              <div className='space-y-4'>
                <div>
                  <Label>Nombre completo</Label>
                  <div className='text-sm text-foreground mt-1'>
                    {formData.full_name || "Sin nombre"}
                  </div>
                </div>

                {/* Bio removed */}

                {/* City/Province removed */}

                {/* Phone editable */}
                <div>
                  <Label htmlFor='phone'>Teléfono</Label>
                  <Input
                    id='phone'
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder='Tu número de teléfono'
                  />
                </div>

                <div>
                  <Label htmlFor='whatsapp_phone'>WhatsApp (contacto)</Label>
                  <Input
                    id='whatsapp_phone'
                    value={formData.whatsapp_phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp_phone: e.target.value,
                      })
                    }
                    placeholder='Ej: +54 9 11 1234-5678'
                  />
                </div>

                <div className='flex gap-2 pt-4'>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className='flex-1'
                  >
                    <Save className='w-4 h-4 mr-2' />
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Logout Button - Mobile Only */}
        <div className='md:hidden'>
          <Button
            onClick={handleLogout}
            variant='outline'
            className='w-full justify-start gap-3 border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 hover:text-red-700'
          >
            <LogOut className='w-5 h-5' />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
