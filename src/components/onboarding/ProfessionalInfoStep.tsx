import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { OnboardingStep } from './OnboardingStep';

export interface ProfessionalInfo {
  bio: string;
  skills: string[];
  tradeName: string;
  yearsExperience: number;
  hourlyRate: number;
}

export interface ProfessionalInfoStepProps {
  data: ProfessionalInfo;
  onChange: (data: Partial<ProfessionalInfo>) => void;
}

export function ProfessionalInfoStep({ data, onChange }: ProfessionalInfoStepProps) {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !data.skills.includes(skillInput.trim())) {
      onChange({ skills: [...data.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    onChange({ skills: data.skills.filter(s => s !== skill) });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <OnboardingStep 
      title="Información profesional"
      description="Contanos sobre tu experiencia y servicios para atraer más clientes"
    >
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="tradeName">Nombre comercial/Empresa *</Label>
          <Input
            id="tradeName"
            value={data.tradeName}
            onChange={(e) => onChange({ tradeName: e.target.value })}
            placeholder="Nombre de tu negocio o como te conocen"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Descripción de tus servicios *</Label>
          <Textarea
            id="bio"
            value={data.bio}
            onChange={(e) => onChange({ bio: e.target.value })}
            placeholder="Describe brevemente qué servicios ofreces y tu experiencia..."
            rows={4}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Habilidades/Servicios *</Label>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Ej: Plomería, Electricidad..."
              onKeyPress={handleKeyPress}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={addSkill}
              disabled={!skillInput.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {data.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent"
                    onClick={() => removeSkill(skill)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="experience">Años de experiencia *</Label>
            <Input
              id="experience"
              type="number"
              min="0"
              max="50"
              value={data.yearsExperience || ''}
              onChange={(e) => onChange({ yearsExperience: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="hourlyRate">Tarifa por hora (ARS)</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="0"
              value={data.hourlyRate || ''}
              onChange={(e) => onChange({ hourlyRate: parseInt(e.target.value) || 0 })}
              placeholder="5000"
            />
            <p className="text-xs text-muted-foreground">
              Opcional - Podés agregarlo más tarde
            </p>
          </div>
        </div>
      </div>
    </OnboardingStep>
  );
}