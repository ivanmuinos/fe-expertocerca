"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/components/ui/card';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Button } from '@/src/shared/components/ui/button';
import { Save } from 'lucide-react';
import { SharedHeader } from '@/src/shared/components/SharedHeader';

export interface ProfessionalServiceData {
  tradeName: string;
  description: string;
  yearsExperience: number;
  hourlyRate: number;
  workPhone?: string;
  whatsappPhone?: string;
}

interface ProfessionalServiceFormProps {
  initialData?: Partial<ProfessionalServiceData>;
  onSave: (data: ProfessionalServiceData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  title?: string;
  subtitle?: string;
}

export function ProfessionalServiceForm({
  initialData = {},
  onSave,
  onCancel,
  loading = false,
  title = "Nueva publicación",
  subtitle = "Crea un nuevo servicio profesional"
}: ProfessionalServiceFormProps) {
  const [data, setData] = useState<ProfessionalServiceData>({
    tradeName: initialData.tradeName || '',
    description: initialData.description || '',
    yearsExperience: initialData.yearsExperience || 0,
    hourlyRate: initialData.hourlyRate || 0,
    workPhone: initialData.workPhone || '',
    whatsappPhone: initialData.whatsappPhone || '',
  });

  const handleSave = async () => {
    await onSave(data);
  };

  const canSave = () => {
    return data.tradeName.trim() && data.description.trim() && data.yearsExperience > 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader showBackButton={true} title={title} />
      
      <div className="px-4 py-8 sm:py-12">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-lg sm:text-xl text-muted-foreground">
              {subtitle}
            </p>
          </div>

        <Card className="shadow-xl">
          <CardHeader className="p-6 sm:p-8 space-y-4">
            <CardTitle className="text-2xl sm:text-3xl">
              Información del servicio
            </CardTitle>
            <p className="text-lg sm:text-xl text-muted-foreground">
              Completa los datos de tu servicio profesional
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {/* Service Name */}
            <div>
              <Label htmlFor="tradeName" className="text-base sm:text-lg font-medium">
                Nombre de tu servicio *
              </Label>
              <Input
                id="tradeName"
                value={data.tradeName}
                onChange={(e) => setData({ ...data, tradeName: e.target.value })}
                placeholder="Ej: Electricista Profesional, Plomero Certificado"
                className="h-12 sm:h-14 text-base sm:text-lg mt-2"
              />
            </div>

            {/* Experience and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="yearsExperience" className="text-base sm:text-lg font-medium">
                  Años de experiencia *
                </Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={data.yearsExperience}
                  onChange={(e) => setData({ ...data, yearsExperience: parseInt(e.target.value) || 0 })}
                  placeholder="5"
                  min="0"
                  className="h-12 sm:h-14 text-base sm:text-lg mt-2"
                />
              </div>
              <div>
                <Label htmlFor="hourlyRate" className="text-base sm:text-lg font-medium">
                  Tarifa por hora (ARS)
                </Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={data.hourlyRate}
                  onChange={(e) => setData({ ...data, hourlyRate: parseInt(e.target.value) || 0 })}
                  placeholder="2500"
                  min="0"
                  className="h-12 sm:h-14 text-base sm:text-lg mt-2"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base sm:text-lg font-medium">
                Descripción de tus servicios *
              </Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="Describe tu experiencia, especialidades y servicios que ofreces..."
                rows={5}
                className="text-base sm:text-lg mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Una buena descripción ayuda a los clientes a entender qué puedes ofrecerles
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Información de contacto (opcional)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="workPhone" className="text-base font-medium">
                    Teléfono de trabajo
                  </Label>
                  <Input
                    id="workPhone"
                    value={data.workPhone}
                    onChange={(e) => setData({ ...data, workPhone: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className="h-12 text-base mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsappPhone" className="text-base font-medium">
                    WhatsApp
                  </Label>
                  <Input
                    id="whatsappPhone"
                    value={data.whatsappPhone}
                    onChange={(e) => setData({ ...data, whatsappPhone: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className="h-12 text-base mt-2"
                  />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Si no completas estos campos, se usará la información de contacto de tu perfil
              </p>
            </div>
          </CardContent>
        </Card>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row justify-between mt-10 sm:mt-12 gap-4">
            <Button
              variant="ghost"
              onClick={onCancel}
              size="lg"
              className="flex items-center justify-center gap-3 h-12 sm:h-14 text-base sm:text-lg order-2 sm:order-1"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!canSave() || loading}
              size="lg"
              className="flex items-center justify-center gap-3 h-12 sm:h-14 text-base sm:text-lg order-1 sm:order-2 min-w-[140px]"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar publicación'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}