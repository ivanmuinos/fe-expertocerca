import { z } from 'zod'

export const ProfessionalFormSchema = z.object({
  trade_name: z.string().min(2, 'El nombre del oficio debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  years_experience: z.number().min(0, 'La experiencia no puede ser negativa').max(50, 'Experiencia máxima 50 años'),
  hourly_rate: z.number().min(0, 'La tarifa no puede ser negativa').optional(),
  whatsapp_phone: z.string().optional(),
  work_phone: z.string().optional(),
})

export const ProfessionalFiltersSchema = z.object({
  location_city: z.string().optional(),
  location_province: z.string().optional(),
  skills: z.array(z.string()).optional(),
  min_experience: z.number().min(0).optional(),
  max_hourly_rate: z.number().min(0).optional(),
})

export type ProfessionalFormInput = z.infer<typeof ProfessionalFormSchema>
export type ProfessionalFiltersInput = z.infer<typeof ProfessionalFiltersSchema>