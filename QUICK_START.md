# 🚀 Quick Start - Arquitectura SOLID

## 📦 ¿Qué tengo disponible?

### 🎣 Hooks (Para Componentes React)

```typescript
import {
  // User Profile
  useUserProfile,
  useUpdateUserProfile,
  useSetUserType,
  useOnboardingStatus,
  
  // Professionals
  useProfessionals,
  useDiscoverProfessionals,
  useMyProfessionalProfiles,
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
  
  // Portfolio
  usePortfolio,
  useCreatePortfolioItem,
  
  // Reviews
  useReviews,
  useCreateReview,
} from '@/src/shared/hooks'
```

### 🔧 Servicios (Para Server Components / API Routes)

```typescript
import { container } from '@/src/core/di'

// Obtener servicios
const professionalsService = container.getProfessionalsService()
const userProfileService = container.getUserProfileService()
const authService = container.getAuthService()

// Obtener repositorios (acceso directo a datos)
const professionalsRepo = container.getProfessionalsRepository()
const userProfileRepo = container.getUserProfileRepository()
const portfolioRepo = container.getPortfolioRepository()
const reviewsRepo = container.getReviewsRepository()
const onboardingRepo = container.getOnboardingRepository()

// HTTP Client (si necesitas hacer requests custom)
const httpClient = container.getHttpClient()
```

## 🎯 Casos de Uso Comunes

### 1. Mostrar lista de profesionales

```typescript
'use client'

import { useMyProfessionalProfiles } from '@/src/shared/hooks'

export default function MyProfessionalsPage() {
  const { profiles, isLoading } = useMyProfessionalProfiles()
  
  if (isLoading) return <div>Cargando...</div>
  
  return (
    <div>
      {profiles.map(p => (
        <div key={p.id}>{p.specialty}</div>
      ))}
    </div>
  )
}
```

### 2. Editar perfil de usuario

```typescript
'use client'

import { useUserProfile, useUpdateUserProfile } from '@/src/shared/hooks'

export default function ProfileEditor() {
  const { profile } = useUserProfile()
  const updateProfile = useUpdateUserProfile()
  
  const handleSave = (data: any) => {
    updateProfile.mutate(data)
  }
  
  return (
    <form onSubmit={handleSave}>
      <input defaultValue={profile?.full_name} />
      <button type="submit">Guardar</button>
    </form>
  )
}
```

### 3. Server Component con datos

```typescript
import { container } from '@/src/core/di'

export default async function ProfessionalsPage() {
  const service = container.getProfessionalsService()
  const professionals = await service.discoverProfessionals()
  
  return (
    <div>
      {professionals.map(p => (
        <div key={p.id}>{p.specialty}</div>
      ))}
    </div>
  )
}
```

### 4. API Route

```typescript
import { container } from '@/src/core/di'

export async function GET() {
  const service = container.getProfessionalsService()
  const data = await service.getMyProfiles()
  
  return Response.json({ data })
}
```

### 5. Crear un nuevo profesional

```typescript
'use client'

import { useCreateProfessional } from '@/src/shared/hooks'

export default function CreateForm() {
  const createProfessional = useCreateProfessional()
  
  const handleSubmit = (data: any) => {
    createProfessional.mutate(data, {
      onSuccess: () => {
        console.log('✅ Creado!')
      }
    })
  }
  
  return <form onSubmit={handleSubmit}>...</form>
}
```

## 📁 Estructura Rápida

```
src/
├── core/                    # ⭐ Nuevo - Lógica de negocio
│   ├── interfaces/         # Contratos
│   ├── repositories/       # Acceso a datos
│   ├── services/           # Lógica de negocio
│   └── di/                 # Dependency Injection
│
├── infrastructure/         # ⭐ Nuevo - Implementaciones
│   ├── http/              # Cliente HTTP
│   └── supabase/          # Auth Provider
│
├── features/              # Features por dominio
├── shared/                # Código compartido
│   ├── hooks/            # ⭐ Hooks mejorados
│   └── lib/              # Utilidades
└── app/                   # Next.js pages
```

## 🎨 Patrones

### ✅ Hacer

```typescript
// En componentes React
const { data } = useMyProfessionalProfiles()

// En Server Components
const service = container.getProfessionalsService()
const data = await service.getMyProfiles()

// En API Routes
const service = container.getProfessionalsService()
```

### ❌ Evitar

```typescript
// No uses apiClient directamente en código nuevo
import { apiClient } from '@/src/shared/lib/api-client'
const data = await apiClient.getMyProfiles() // ❌

// No importes supabase directamente
import { supabase } from '@/src/config/supabase'
const { data } = await supabase.from('...') // ❌
```

## 🔍 ¿Dónde está cada cosa?

| Necesito... | Usar... | Ubicación |
|------------|---------|-----------|
| Hook para componente | `useMyProfessionalProfiles()` | `@/src/shared/hooks` |
| Servicio en Server Component | `container.getProfessionalsService()` | `@/src/core/di` |
| Acceso directo a datos | `container.getProfessionalsRepository()` | `@/src/core/di` |
| Cliente HTTP custom | `container.getHttpClient()` | `@/src/core/di` |

## 📚 Documentación Completa

- **[SOLID_REFACTOR.md](./SOLID_REFACTOR.md)** - Resumen de la refactorización
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura detallada
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guía de migración
- **[examples/USAGE_EXAMPLES.tsx](./examples/USAGE_EXAMPLES.tsx)** - Ejemplos de código

## 💡 Tips

1. **Usa hooks en componentes cliente** (`'use client'`)
2. **Usa servicios en Server Components** (sin `'use client'`)
3. **Usa servicios en API Routes**
4. **El código legacy sigue funcionando** - migra gradualmente
5. **TypeScript te guiará** - sigue los tipos

## 🆘 Ayuda Rápida

### Error: "Service not found in container"
→ El servicio no está registrado en `src/core/di/container.ts`

### Error: "Cannot use hooks"
→ Asegúrate de tener `'use client'` en el componente

### Error: "Module not found"
→ Usa rutas absolutas: `@/src/...`

## ✨ ¡Listo!

Ya puedes empezar a usar la nueva arquitectura. Todo el código legacy sigue funcionando, así que puedes migrar gradualmente.

**Happy coding!** 🎉
