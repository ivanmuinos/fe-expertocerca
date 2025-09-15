# 🏗️ Arquitectura del Proyecto - ExpertoCerca

## 📁 Estructura de Carpetas

```
├── src/                          # 🔥 Enterprise-grade structure
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/               # Route groups
│   │   ├── api/                  # API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── providers.tsx         # Root providers
│   │
│   ├── features/                 # 🚀 Feature-first architecture
│   │   ├── auth/                 # Authentication feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── stores/           # Zustand stores
│   │   │   ├── types/
│   │   │   └── index.ts          # Barrel exports
│   │   ├── professionals/        # Professional management
│   │   │   ├── components/
│   │   │   ├── hooks/            # TanStack Query hooks
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── schemas/          # Zod validation
│   │   ├── user-profile/         # User profiles & portfolio
│   │   ├── onboarding/           # User onboarding flow
│   │   └── publications/         # Publication management
│   │
│   ├── shared/                   # Shared infrastructure
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui design system
│   │   │   ├── providers/        # React Query + Auth providers
│   │   │   ├── navigation/       # Header, nav components
│   │   │   ├── layout/           # Layout components
│   │   │   ├── forms/            # Form components
│   │   │   └── onboarding/       # Onboarding components
│   │   ├── hooks/                # Shared custom hooks
│   │   ├── lib/                  # Utility functions
│   │   ├── stores/               # Shared Zustand stores
│   │   └── types/                # Shared TypeScript types
│   │
│   ├── config/                   # App configuration
│   │   ├── env.ts                # Environment validation (Zod)
│   │   ├── supabase.ts           # Supabase client
│   │   └── query-client.ts       # TanStack Query setup
│   │
│   ├── integrations/             # External APIs (Supabase)
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   │
│   └── pages/                    # Legacy pages (to be migrated)
│
├── public/                       # Static assets
├── docs/                         # Documentation
└── scripts/                      # Build/deployment scripts
```

## 🚀 Stack Tecnológico

### Core
- **Next.js 15** con App Router
- **TypeScript 5.0+** (strict mode)
- **TailwindCSS** + **shadcn/ui**

### Estado y Data
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **Zod** - Schema validation

### Backend
- **Supabase** - Database, Auth, Storage
- **PostgreSQL** - Database
- **Real-time subscriptions**

### Development
- **ESLint** + **TypeScript ESLint**
- **Capacitor** - Mobile deployment

## 🎯 Principios de Arquitectura

### 1. Feature-First Organization
```typescript
// ✅ Bueno: Todo relacionado a auth está junto
src/features/auth/
├── components/AuthProvider.tsx
├── hooks/useAuth.ts
├── services/authService.ts
└── types/index.ts

// ❌ Malo: Separado por tipo de archivo
src/components/AuthProvider.tsx
src/hooks/useAuth.ts
src/services/authService.ts
```

### 2. Barrel Exports
```typescript
// src/features/auth/index.ts
export { useAuth } from './hooks/useAuth'
export { AuthProvider } from './components/AuthProvider'
export type { AuthUser } from './types'

// Uso limpio
import { useAuth, AuthProvider, type AuthUser } from '@/src/features/auth'
```

### 3. Dependency Injection Pattern
```typescript
// Services son intercambiables y testeable
interface AuthService {
  signIn: (credentials: Credentials) => Promise<User>
  signOut: () => Promise<void>
}

// Implementación con Supabase
class SupabaseAuthService implements AuthService {
  // ...
}
```

### 4. Type Safety End-to-End
```typescript
// Desde DB hasta UI, todo tipado
type DatabaseUser = Database['public']['Tables']['users']['Row']
type AuthUser = Pick<DatabaseUser, 'id' | 'email' | 'full_name'>

// Validación con Zod
const UserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(2),
})
```

## 🔄 Migración en Progreso

### ✅ Completado
- [x] Estructura base de carpetas
- [x] Feature de autenticación migrada
- [x] Configuración de TanStack Query + Zustand
- [x] Providers centralizados
- [x] Configuración de entorno con Zod

### 🚧 En Proceso
- [ ] Migrar feature de profesionales
- [ ] Migrar feature de publicaciones
- [ ] Actualizar todas las importaciones
- [ ] Eliminar carpetas legacy

### 📋 Por Hacer
- [ ] Implementar error boundaries
- [ ] Configurar testing (Vitest + Testing Library)
- [ ] Optimizar bundle splitting
- [ ] Documentar componentes con Storybook

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo en puerto 8080

# Build
npm run build           # Build optimizado para producción
npm run build:dev       # Build de desarrollo

# Linting
npm run lint            # ESLint check

# Mobile
npm run capacitor:build      # Build para Capacitor
npm run capacitor:run:ios    # Run en iOS
npm run capacitor:run:android # Run en Android
```

## 📖 Convenciones de Código

### Imports
```typescript
// 1. React y librerías externas
import React from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Features (absolute paths)
import { useAuth } from '@/src/features/auth'

// 3. Shared (absolute paths)
import { Button } from '@/src/shared/components/ui'

// 4. Relative imports (misma feature)
import { AuthService } from './auth-service'
```

### Naming
- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase con 'use' prefix (`useUserProfile.ts`)
- **Services**: camelCase con 'Service' suffix (`userService.ts`)
- **Types**: PascalCase (`User`, `UserProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (`API_ENDPOINTS`)

### File Structure
```typescript
// Cada feature sigue esta estructura:
feature/
├── components/           # UI components específicos
├── hooks/               # Custom hooks
├── services/            # Business logic & API calls
├── stores/              # State management (Zustand)
├── types/               # TypeScript types
├── schemas/             # Zod validation schemas
└── index.ts             # Barrel exports
```

## 🔗 Recursos

- [Next.js 15 Docs](https://nextjs.org/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)