"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useNavigate } from "@/src/shared/lib/navigation";
import { useAuthState, useAuthActions } from "@/src/features/auth";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Textarea } from "@/src/shared/components/ui/textarea";
import {
  Save,
  LogOut,
  MapPin,
  Phone,
  Edit2,
  X,
  MessageCircle,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Globe,
} from "lucide-react";
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
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    twitter_url: "",
    website_url: "",
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
        // Quitar el prefijo +54 si existe para mostrarlo limpio en el input
        const cleanWhatsapp = data.whatsapp_phone
          ? data.whatsapp_phone.replace(/^\+54\s?/, "")
          : "";

        setFormData({
          full_name: data.full_name || "",
          phone: data.phone || "",
          whatsapp_phone: cleanWhatsapp,
          bio: "",
          location_city: data.location_city || "",
          location_province: data.location_province || "",
          avatar_url: data.avatar_url || "",
          facebook_url: data.facebook_url || "",
          instagram_url: data.instagram_url || "",
          linkedin_url: data.linkedin_url || "",
          twitter_url: data.twitter_url || "",
          website_url: data.website_url || "",
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
      // Construir el número completo con el prefijo +54
      const fullWhatsappNumber = formData.whatsapp_phone.trim()
        ? `+54${formData.whatsapp_phone.replace(/\s/g, "")}`
        : "";

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          whatsapp_phone: fullWhatsappNumber,
          avatar_url: formData.avatar_url,
          facebook_url: formData.facebook_url,
          instagram_url: formData.instagram_url,
          linkedin_url: formData.linkedin_url,
          twitter_url: formData.twitter_url,
          website_url: formData.website_url,
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
        {/* Custom header for perfil - Mobile only */}
        <header className='lg:hidden sticky top-0 z-40 bg-primary'>
          <div className='flex items-center justify-between h-10 px-4'>
            <button
              onClick={() => navigate(-1)}
              className='p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors'
            >
              <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
              </svg>
            </button>

            <Image
              src='/logo-bco-experto-cerca.svg'
              alt='Experto Cerca'
              width={120}
              height={24}
              className='h-6 w-auto'
              priority
            />

            <div className='w-9' />
          </div>
        </header>

        {/* Desktop header */}
        <div className='hidden lg:block'>
          <SharedHeader variant='transparent' showBackButton={true} />
        </div>

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
    <>
      {/* Custom header for perfil - Mobile only */}
      <header className='lg:hidden sticky top-0 z-40 bg-primary'>
        <div className='flex items-center justify-between h-10 px-4'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors'
          >
            <svg className='w-5 h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
            </svg>
          </button>

          <Image
            src='/logo-bco-experto-cerca.svg'
            alt='Experto Cerca'
            width={120}
            height={24}
            className='h-6 w-auto'
            priority
          />

          <div className='w-9' />
        </div>
      </header>

      {/* Desktop header */}
      <div className='hidden lg:block'>
        <SharedHeader variant='transparent' showBackButton={true} />
      </div>

      <div className='max-w-4xl mx-auto px-4 py-4 md:py-8 pb-24 md:pb-8'>

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
                  <div className='relative'>
                    <div className='absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 text-sm'>
                      <MessageCircle className='w-4 h-4 text-green-500' />
                      <span className='text-gray-600'>+54</span>
                    </div>
                    <Input
                      id='whatsapp_phone'
                      type='tel'
                      value={formData.whatsapp_phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Solo permitir números, espacios, guiones y paréntesis
                        const cleaned = value.replace(/[^\d\s\-()]/g, "");
                        setFormData({
                          ...formData,
                          whatsapp_phone: cleaned,
                        });
                      }}
                      placeholder='9 11 1234 5678'
                      className='pl-20'
                    />
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Ingresá tu número sin el código de país. Ej: 11 1234 5678
                  </p>
                </div>

                {/* Social Media Section */}
                <div className='pt-4 border-t border-border'>
                  <h3 className='text-sm font-medium text-foreground mb-4'>
                    Redes sociales (opcional)
                  </h3>
                  <div className='space-y-4'>
                    {/* Facebook */}
                    <div>
                      <Label
                        htmlFor='facebook_url'
                        className='flex items-center gap-2'
                      >
                        <Facebook className='w-4 h-4 text-blue-600' />
                        Facebook
                      </Label>
                      <Input
                        id='facebook_url'
                        value={formData.facebook_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            facebook_url: e.target.value,
                          })
                        }
                        placeholder='https://facebook.com/tu-perfil'
                      />
                    </div>

                    {/* Instagram */}
                    <div>
                      <Label
                        htmlFor='instagram_url'
                        className='flex items-center gap-2'
                      >
                        <Instagram className='w-4 h-4 text-pink-600' />
                        Instagram
                      </Label>
                      <Input
                        id='instagram_url'
                        value={formData.instagram_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            instagram_url: e.target.value,
                          })
                        }
                        placeholder='https://instagram.com/tu-perfil'
                      />
                    </div>

                    {/* LinkedIn */}
                    <div>
                      <Label
                        htmlFor='linkedin_url'
                        className='flex items-center gap-2'
                      >
                        <Linkedin className='w-4 h-4 text-blue-700' />
                        LinkedIn
                      </Label>
                      <Input
                        id='linkedin_url'
                        value={formData.linkedin_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            linkedin_url: e.target.value,
                          })
                        }
                        placeholder='https://linkedin.com/in/tu-perfil'
                      />
                    </div>

                    {/* Twitter */}
                    <div>
                      <Label
                        htmlFor='twitter_url'
                        className='flex items-center gap-2'
                      >
                        <Twitter className='w-4 h-4 text-sky-500' />
                        Twitter/X
                      </Label>
                      <Input
                        id='twitter_url'
                        value={formData.twitter_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            twitter_url: e.target.value,
                          })
                        }
                        placeholder='https://twitter.com/tu-perfil'
                      />
                    </div>

                    {/* Website */}
                    <div>
                      <Label
                        htmlFor='website_url'
                        className='flex items-center gap-2'
                      >
                        <Globe className='w-4 h-4 text-gray-600' />
                        Sitio web
                      </Label>
                      <Input
                        id='website_url'
                        value={formData.website_url}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            website_url: e.target.value,
                          })
                        }
                        placeholder='https://tu-sitio.com'
                      />
                    </div>
                  </div>
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
    </>
  );
}
