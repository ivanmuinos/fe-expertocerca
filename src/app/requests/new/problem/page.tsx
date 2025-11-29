"use client";

import { useNavigate } from "@/src/shared/lib/navigation";
import { useServiceRequestStore } from "@/src/features/service-requests/stores/useServiceRequestStore";
import ServiceRequestChrome from "../ServiceRequestChrome";
import { Label } from "@/src/shared/components/ui/label";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import { motion } from "framer-motion";
import { useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

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

const TITLE_MIN_LENGTH = 5;
const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MIN_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 500;

export default function ProblemaPage() {
  const navigate = useNavigate();
  const { category, title, description, setField } = useServiceRequestStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [touched, setTouched] = useState({
    title: false,
    description: false,
  });

  // Validation functions
  const validateTitle = (value: string) => {
    if (!value.trim()) {
      return { valid: false, message: "El título es requerido" };
    }
    if (value.length < TITLE_MIN_LENGTH) {
      return { valid: false, message: `Mínimo ${TITLE_MIN_LENGTH} caracteres` };
    }
    if (value.length > TITLE_MAX_LENGTH) {
      return { valid: false, message: `Máximo ${TITLE_MAX_LENGTH} caracteres` };
    }
    // Check for invalid characters (allow letters, numbers, spaces, and common punctuation)
    const validPattern = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\s.,;:¿?¡!\-()]+$/;
    if (!validPattern.test(value)) {
      return { valid: false, message: "Contiene caracteres no permitidos" };
    }
    return { valid: true, message: "" };
  };

  const validateDescription = (value: string) => {
    if (!value.trim()) {
      return { valid: false, message: "La descripción es requerida" };
    }
    if (value.length < DESCRIPTION_MIN_LENGTH) {
      return { valid: false, message: `Mínimo ${DESCRIPTION_MIN_LENGTH} caracteres` };
    }
    if (value.length > DESCRIPTION_MAX_LENGTH) {
      return { valid: false, message: `Máximo ${DESCRIPTION_MAX_LENGTH} caracteres` };
    }
    return { valid: true, message: "" };
  };

  const titleValidation = validateTitle(title);
  const descriptionValidation = validateDescription(description);

  const isValid = category && titleValidation.valid && descriptionValidation.valid;

  const handleContinue = () => {
    if (isValid) {
      setIsNavigating(true);
      navigate("/requests/new/photos");
    }
  };

  return (
    <ServiceRequestChrome
      progress={33}
      footerRight={{
        label: "Continuar",
        onClick: handleContinue,
        disabled: !isValid || isNavigating,
        loading: isNavigating,
      }}
      footerLeft={{
        label: "Cancelar",
        onClick: () => navigate("/"),
      }}
    >
      <div className="w-full max-w-md md:max-w-2xl mx-auto px-4 py-4 md:px-4 md:py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-foreground mb-2">
              ¿Qué necesitas resolver?
            </h1>
            <p className="text-sm text-muted-foreground">
              Describe tu problema para encontrar al experto adecuado.
            </p>
          </div>

          <div className="space-y-6 bg-white/50 rounded-2xl p-6 border border-border/20">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={category}
                onValueChange={(value) => setField('category', value)}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título breve</Label>
              <div className="relative">
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setField('title', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                  placeholder="Ej: Reparación de calefón"
                  className={`bg-white pr-10 ${
                    touched.title && !titleValidation.valid
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : touched.title && titleValidation.valid
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                  maxLength={TITLE_MAX_LENGTH}
                />
                {touched.title && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {titleValidation.valid ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  {touched.title && !titleValidation.valid && (
                    <p className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {titleValidation.message}
                    </p>
                  )}
                </div>
                <p className={`${
                  title.length > TITLE_MAX_LENGTH * 0.9
                    ? 'text-orange-500'
                    : 'text-muted-foreground'
                }`}>
                  {title.length}/{TITLE_MAX_LENGTH}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción detallada</Label>
              <div className="relative">
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setField('description', e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                  placeholder="Explica qué sucede, marcas, modelos, etc..."
                  className={`bg-white min-h-[120px] ${
                    touched.description && !descriptionValidation.valid
                      ? 'border-red-500 focus-visible:ring-red-500'
                      : touched.description && descriptionValidation.valid
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : ''
                  }`}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                />
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  {touched.description && !descriptionValidation.valid && (
                    <p className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {descriptionValidation.message}
                    </p>
                  )}
                </div>
                <p className={`${
                  description.length < DESCRIPTION_MIN_LENGTH
                    ? 'text-muted-foreground'
                    : description.length > DESCRIPTION_MAX_LENGTH * 0.9
                    ? 'text-orange-500'
                    : 'text-green-600'
                }`}>
                  {description.length}/{DESCRIPTION_MAX_LENGTH}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ServiceRequestChrome>
  );
}
