import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { OnboardingStep } from './OnboardingStep';

export interface PersonalInfo {
  fullName: string;
  phone: string;
  locationProvince: string;
  locationCity: string;
}

export interface PersonalInfoStepProps {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
}

export function PersonalInfoStep({ data, onChange }: PersonalInfoStepProps) {
  return (
    <OnboardingStep 
      title="Datos personales"
      description="Información básica de contacto para que los usuarios puedan encontrarte"
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Nombre completo *</Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="Tu nombre completo"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+54 9 11 1234-5678"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="province">Provincia *</Label>
            <Input
              id="province"
              value={data.locationProvince}
              onChange={(e) => onChange({ locationProvince: e.target.value })}
              placeholder="Buenos Aires"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="city">Ciudad *</Label>
            <Input
              id="city"
              value={data.locationCity}
              onChange={(e) => onChange({ locationCity: e.target.value })}
              placeholder="CABA"
              required
            />
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}