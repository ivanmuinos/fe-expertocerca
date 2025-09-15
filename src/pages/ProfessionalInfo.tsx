"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from '@/src/shared/lib/navigation';
import { useAuthState } from '@/src/features/auth'
import { useProfiles, type OnboardingData } from '@/src/features/user-profile';
import { useLoading } from '@/src/shared/stores/useLoadingStore';
import { LoadingButton } from '@/src/shared/components/ui/loading-button';
import { Button } from '@/src/shared/components/ui/button';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { Badge } from '@/src/shared/components/ui/badge';
import { Star, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export interface ProfessionalInfoForm {
  tradeName: string;
  bio: string;
  skills: string[];
  yearsExperience: number;
  hourlyRate: number;
}

export default function ProfessionalInfo() {
  const navigate = useNavigate();
  const { user, loading } = useAuthState();
  const { saveOnboardingData } = useProfiles();
  const { withLoading } = useLoading();
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState<ProfessionalInfoForm>({
    tradeName: '',
    bio: '',
    skills: [],
    yearsExperience: 0,
    hourlyRate: 0
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/auth?next=/professional-info');
    }
  }, [user, navigate]);

  const handleBack = () => {
    navigate('/personal-data');
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleContinue = async () => {
    if (!user) return;
    
    try {
      await withLoading(async () => {
        // Get personal data from previous step (this would normally come from a store)
        const personalData = {
          fullName: user.user_metadata?.full_name || '',
          phone: '', // This would come from the store
          locationProvince: '', // This would come from the store  
          locationCity: '' // This would come from the store
        };

        const onboardingData: OnboardingData = {
          ...personalData,
          ...formData
        };
        
        const result = await saveOnboardingData(onboardingData, user.id);
        
        if (result.success) {
          navigate('/completion');
        } else {
          throw new Error('Failed to save professional info');
        }
      }, "Completando tu perfil...");
    } catch (error) {
      console.error('Error saving professional info:', error);
    }
  };

  const updateFormData = (field: keyof ProfessionalInfoForm, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      updateFormData('skills', [...formData.skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData('skills', formData.skills.filter(s => s !== skill));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const canProceed = !!(formData.tradeName && formData.bio && 
                        formData.skills.length > 0 && formData.yearsExperience > 0);

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="h-screen bg-gradient-subtle flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleExit}
            className="px-4 py-2 bg-white border-gray-300 rounded-full hover:bg-gray-100 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-medium transition-all duration-200"
          >
            Salir
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 w-full max-w-md md:max-w-2xl mx-auto px-4 py-6 flex flex-col min-h-0">
        {/* Form */}
        <div className="flex-1 overflow-auto scrollbar-hide">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Title inside scrollable area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <h1 className="text-xl text-foreground text-left">
                Información profesional
              </h1>
              <p className="text-muted-foreground mt-2 text-left">
                Contanos sobre tu experiencia y servicios para atraer más clientes
              </p>
            </motion.div>
            {/* Trade Name */}
            <div className="space-y-2">
              <Label htmlFor="tradeName">Nombre comercial/Empresa *</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => updateFormData('tradeName', e.target.value)}
                placeholder="Nombre de tu negocio o como te conocen"
                className="h-12"
                required
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Descripción de tus servicios *</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Describe brevemente qué servicios ofreces y tu experiencia..."
                rows={4}
                className="resize-none"
                required
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label>Habilidades/Servicios *</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Ej: Plomería, Electricidad..."
                  onKeyPress={handleKeyPress}
                  className="h-12"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={addSkill}
                  disabled={!skillInput.trim()}
                  className="h-12 w-12"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="flex items-center gap-1 text-sm py-1">
                      {skill}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 hover:bg-transparent ml-1"
                        onClick={() => removeSkill(skill)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Experience and Rate */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience">Años de experiencia *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.yearsExperience || ''}
                  onChange={(e) => updateFormData('yearsExperience', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="h-12"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Tarifa por hora (ARS)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  value={formData.hourlyRate || ''}
                  onChange={(e) => updateFormData('hourlyRate', parseInt(e.target.value) || 0)}
                  placeholder="5000"
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Opcional - Podés agregarlo más tarde
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Progress Bar - Full Width */}
      <div className="flex-shrink-0 w-full bg-gray-200">
        <div 
          className="h-2 bg-primary"
          style={{ width: '95%' }}
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 w-full bg-background/95 backdrop-blur-sm">
        <div className="w-full px-8 py-6">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-sm text-black hover:text-gray-700 underline font-medium"
            >
              Atrás
            </button>
            <LoadingButton
              onClick={handleContinue}
              disabled={!canProceed}
              className="px-8 h-12 text-base font-medium"
            >
              Completar perfil
            </LoadingButton>
          </div>
        </div>
      </div>
    </div>
  );
}