"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles, type OnboardingData } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Check, ArrowLeft } from 'lucide-react';
import { SharedHeader } from '@/components/SharedHeader';

const steps = [
  { id: 1, title: 'Datos personales', description: 'Información básica de contacto' },
  { id: 2, title: 'Servicios (opcional)', description: 'Si querés ofrecer servicios' },
  { id: 3, title: 'Completado', description: 'Todo listo para empezar' }
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [offerServices, setOfferServices] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    fullName: '',
    phone: '',
    locationProvince: '',
    locationCity: '',
    bio: '',
    skills: [],
    tradeName: '',
    yearsExperience: 0,
    hourlyRate: 0
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { loading, saveOnboardingData } = useProfiles();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth?next=/onboarding');
    }
  }, [user, navigate]);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save to Supabase and complete onboarding
      if (!user) return;
      
      // Only include service data if user wants to offer services
      const finalData = offerServices ? data : {
        ...data,
        tradeName: undefined,
        yearsExperience: undefined,
        hourlyRate: undefined
      };
      
      const result = await saveOnboardingData(finalData, user.id);
      
      if (result.success) {
        navigate('/');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return data.fullName && data.phone && data.locationProvince && data.locationCity;
      case 2:
        return !offerServices || (data.tradeName && data.bio && data.skills.length > 0);
      default:
        return true;
    }
  };

  const progressPercentage = (currentStep / steps.length) * 100;

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedHeader showBackButton={true} title="Configuración inicial" />
      
      <div className="px-4 py-8 sm:py-12">
        <div className="container mx-auto max-w-3xl">
          {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-end mb-4">
            <span className="text-lg text-muted-foreground font-medium">
              Paso {currentStep} de {steps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        <Card className="shadow-xl">
          <CardHeader className="p-6 sm:p-8 space-y-4">
            <CardTitle className="text-2xl sm:text-3xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-lg sm:text-xl text-muted-foreground">
              {steps[currentStep - 1].description}
            </p>
          </CardHeader>
          <CardContent className="space-y-8 p-6 sm:p-8">
            {/* Step 1: Personal Data */}
            {currentStep === 1 && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <Label htmlFor="fullName" className="text-base sm:text-lg font-medium">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    placeholder="Tu nombre y apellido"
                    className="h-12 sm:h-14 text-base sm:text-lg mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-base sm:text-lg font-medium">Teléfono</Label>
                  <Input
                    id="phone"
                    value={data.phone}
                    onChange={(e) => setData({ ...data, phone: e.target.value })}
                    placeholder="+54 9 11 1234-5678"
                    className="h-12 sm:h-14 text-base sm:text-lg mt-2"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="province" className="text-base sm:text-lg font-medium">Provincia</Label>
                    <Input
                      id="province"
                      value={data.locationProvince}
                      onChange={(e) => setData({ ...data, locationProvince: e.target.value })}
                      placeholder="Buenos Aires"
                      className="h-12 sm:h-14 text-base sm:text-lg mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-base sm:text-lg font-medium">Ciudad</Label>
                    <Input
                      id="city"
                      value={data.locationCity}
                      onChange={(e) => setData({ ...data, locationCity: e.target.value })}
                      placeholder="CABA"
                      className="h-12 sm:h-14 text-base sm:text-lg mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Optional Services */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="offerServices"
                    checked={offerServices}
                    onCheckedChange={(checked) => setOfferServices(checked as boolean)}
                  />
                  <Label htmlFor="offerServices" className="text-sm font-medium">
                    Quiero ofrecer servicios profesionales
                  </Label>
                </div>
                
                {offerServices && (
                  <div className="space-y-4 border-l-4 border-primary pl-4">
                    <div>
                      <Label htmlFor="tradeName">Nombre de tu servicio</Label>
                      <Input
                        id="tradeName"
                        value={data.tradeName}
                        onChange={(e) => setData({ ...data, tradeName: e.target.value })}
                        placeholder="Ej: Electricista Profesional"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="yearsExperience">Años de experiencia</Label>
                        <Input
                          id="yearsExperience"
                          type="number"
                          value={data.yearsExperience}
                          onChange={(e) => setData({ ...data, yearsExperience: parseInt(e.target.value) || 0 })}
                          placeholder="5"
                          min="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="hourlyRate">Tarifa por hora (ARS)</Label>
                        <Input
                          id="hourlyRate"
                          type="number"
                          value={data.hourlyRate}
                          onChange={(e) => setData({ ...data, hourlyRate: parseInt(e.target.value) || 0 })}
                          placeholder="2500"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="bio">Descripción de tus servicios</Label>
                      <Textarea
                        id="bio"
                        value={data.bio}
                        onChange={(e) => setData({ ...data, bio: e.target.value })}
                        placeholder="Contá brevemente sobre tu experiencia y servicios..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="skills">Especialidades (separadas por coma)</Label>
                      <Input
                        id="skills"
                        value={data.skills.join(', ')}
                        onChange={(e) => setData({ 
                          ...data, 
                          skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                        })}
                        placeholder="electricidad, instalaciones, reparaciones"
                      />
                    </div>
                  </div>
                )}
                
                {!offerServices && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Solo vas a buscar y contratar servicios. Podés agregar servicios más tarde.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Completion */}
            {currentStep === 3 && (
              <div className="text-center py-8">
                <Check className="w-20 h-20 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-4">¡Todo listo!</h3>
                <p className="text-muted-foreground mb-6">
                  Tu perfil ha sido configurado exitosamente. 
                  {offerServices 
                    ? ' Ya podés empezar a recibir solicitudes de trabajo y buscar otros servicios.'
                    : ' Ya podés buscar y contratar profesionales. También podés agregar tus servicios más tarde.'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row justify-between mt-10 sm:mt-12 gap-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1}
            size="lg"
            className="flex items-center justify-center gap-3 h-12 sm:h-14 text-base sm:text-lg order-2 sm:order-1"
          >
            <ArrowLeft className="w-5 h-5" />
            Atrás
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            size="lg"
            className="flex items-center justify-center gap-3 h-12 sm:h-14 text-base sm:text-lg order-1 sm:order-2 min-w-[140px]"
          >
            {currentStep === 3 ? 'Finalizar' : 'Siguiente'}
            {currentStep < 3 && <ArrowRight className="w-5 h-5" />}
            {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>}
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}