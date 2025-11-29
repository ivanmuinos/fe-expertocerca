"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useCreateServiceRequest } from '../hooks/useServiceRequests';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import type { ServiceRequestFormData } from '../types';
import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Label } from '@/src/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/components/ui/select';
import { PhotoUploader } from './PhotoUploader';
import { LoadingButton } from '@/src/shared/components/ui/loading-button';
import { useNavigate } from '@/src/shared/lib/navigation';
import { useToast } from '@/src/shared/hooks/use-toast';

const serviceCategories = [
  'Electricista',
  'Plomero',
  'Carpintero',
  'Pintor',
  'Albañil',
  'Jardinero',
  'Mecánico',
  'Técnico en aires',
  'Gasista',
  'Cerrajero',
  'Soldador',
  'Techista',
  'Otro',
];

const formSchema = z.object({
  category: z.string().min(1, 'Selecciona una categoría'),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'Describe tu problema con más detalle (mínimo 20 caracteres)'),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  location_city: z.string().min(1, 'Ingresa tu ciudad'),
  location_province: z.string().min(1, 'Ingresa tu provincia'),
});

type FormData = z.infer<typeof formSchema>;

interface ServiceRequestFormProps {
  onSuccess?: () => void;
}

export function ServiceRequestForm({ onSuccess }: ServiceRequestFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const createMutation = useCreateServiceRequest();
  const { uploadMultiplePhotos, uploading } = usePhotoUpload();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const category = watch('category');

  const onSubmit = async (data: FormData) => {
    try {
      let photoUrls: string[] = [];
      
      // Upload photos if any
      if (photos.length > 0) {
        toast({
          title: 'Subiendo fotos...',
          description: `Subiendo ${photos.length} foto(s)`,
        });
        photoUrls = await uploadMultiplePhotos(photos);
      }

      // Create service request with photo URLs
      await createMutation.mutateAsync({
        category: data.category,
        title: data.title,
        description: data.description,
        contact_phone: data.contact_phone,
        contact_email: data.contact_email,
        location_city: data.location_city,
        location_province: data.location_province,
        photos: photoUrls,
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/requests');
      }
    } catch (error) {
      console.error('Error creating service request:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la solicitud. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">Categoría *</Label>
        <Select
          value={category}
          onValueChange={(value) => setValue('category', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="¿Qué tipo de experto necesitas?" />
          </SelectTrigger>
          <SelectContent>
            {serviceCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          placeholder="Ej: Necesito reparar calefón"
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción del problema *</Label>
        <Textarea
          id="description"
          placeholder="Describe con detalle qué necesitas..."
          rows={4}
          {...register('description')}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location_city">Ciudad *</Label>
          <Input
            id="location_city"
            placeholder="Ej: Buenos Aires"
            {...register('location_city')}
          />
          {errors.location_city && (
            <p className="text-sm text-destructive">{errors.location_city.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location_province">Provincia *</Label>
          <Input
            id="location_province"
            placeholder="Ej: CABA"
            {...register('location_province')}
          />
          {errors.location_province && (
            <p className="text-sm text-destructive">{errors.location_province.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_phone">Teléfono de contacto</Label>
        <Input
          id="contact_phone"
          type="tel"
          placeholder="Ej: +54 9 11 1234-5678"
          {...register('contact_phone')}
        />
        {errors.contact_phone && (
          <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_email">Email de contacto</Label>
        <Input
          id="contact_email"
          type="email"
          placeholder="tu@email.com"
          {...register('contact_email')}
        />
        {errors.contact_email && (
          <p className="text-sm text-destructive">{errors.contact_email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Fotos (opcional)</Label>
        <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Cancelar
        </Button>
        <LoadingButton
          type="submit"
          loading={createMutation.isPending || uploading}
          loadingText={uploading ? "Subiendo fotos..." : "Publicando..."}
          className="flex-1"
        >
          Publicar Solicitud
        </LoadingButton>
      </div>
    </form>
  );
}
