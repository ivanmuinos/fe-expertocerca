# Arquitectura SOLID - Experto Cerca

## 📐 Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
Cada clase/módulo tiene una única responsabilidad:
- **Repositories**: Solo acceso a datos
- **Services**: Solo lógica de negocio
- **Hooks**: Solo gestión de estado React
- **HTTP Client**: Solo comunicación HTTP

### 2. Open/Closed Principle (OCP)
El sistema es extensible sin modificar código existente:
- Interfaces definen contratos
- Nuevas implementaciones pueden agregarse sin cambiar el core
- Ejemplo: Puedes cambiar de Fetch a Axios sin tocar los servicios

### 3. Liskov Substitution Principle (LSP)
Las implementaciones son intercambiables:
- `FetchHttpClient` implementa `IHttpClient`
- `SupabaseAuthProvider` implementa `IAuthService`
- Cualquier implementación que cumpla el contrato funciona

### 4. Interface Segregation Principle (ISP)
Interfaces específicas en lugar de generales:
- `IRepository<T>` para CRUD completo
- `IQueryRepository<T>` solo para lectura
- Hooks especializados por dominio

### 5. Dependency Inversion Principle (DIP)
Dependencias de abstracciones, no de implementaciones:
- Services dependen de `IHttpClient`, no de `FetchHttpClient`
- DI Container inyecta las implementaciones concretas

## 🏗️ Estructura del Proyecto

```
src/
├── core/                          # Núcleo de la aplicación
│   ├── interfaces/               # Contratos (IHttpClient, IAuthService, etc.)
│   ├── repositories/             # Acceso a datos (Professionals, UserProfile, etc.)
│   ├── services/                 # Lógica de negocio
│   └── di/                       # Dependency Injection Container
│
├── infrastructure/               # Implementaciones concretas
│   ├── http/                     # FetchHttpClient
│   └── supabase/                 # SupabaseAuthProvider
│
├── features/                     # Features por dominio
│   ├── auth/
│   ├── professionals/
│   ├── publications/
│   └── user-profile/
│
├── shared/                       # Código compartido
│   ├── components/
│   ├── hooks/                    # React hooks usando DI Container
│   └── lib/
│
└── app/                          # Next.js App Router
```

## 🔄 Flujo de Datos

```
Component/Page
    ↓
Hook (React Query)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
    ↓
HTTP Client (Infrastructure)
    ↓
API
```

## 📦 Dependency Injection Container

El DI Container centraliza la creación de instancias:

```typescript
import { container } from '@/src/core/di'

// Obtener servicios
const professionalsService = container.getProfessionalsService()
const authService = container.getAuthService()

// Obtener repositorios
const professionalsRepo = container.getProfessionalsRepository()
const userProfileRepo = container.getUserProfileRepository()

// Obtener HTTP Client
const httpClient = container.getHttpClient()
```

## 🎣 Hooks Recomendados

### Nuevos hooks SOLID (usar estos):

```typescript
// User Profile
import { useUserProfile, useUpdateUserProfile } from '@/src/shared/hooks'

// Professionals
import { 
  useProfessionals, 
  useDiscoverProfessionals,
  useMyProfessionalProfiles 
} from '@/src/shared/hooks'

// Portfolio
import { usePortfolio, useCreatePortfolioItem } from '@/src/shared/hooks'

// Reviews
import { useReviews, useCreateReview } from '@/src/shared/hooks'
```

### Hooks legacy (mantener para compatibilidad):
Los hooks antiguos siguen funcionando pero se recomienda migrar a los nuevos.

## 🔧 Cómo Extender

### Agregar un nuevo Repository:

```typescript
// 1. Crear el repository
export class NewRepository {
  constructor(private httpClient: IHttpClient) {}
  
  async findAll() {
    return this.httpClient.get('/new-endpoint')
  }
}

// 2. Registrar en el DI Container
// src/core/di/container.ts
const newRepo = new NewRepository(httpClient)
this.services.set('NewRepository', newRepo)
```

### Agregar un nuevo Service:

```typescript
// 1. Crear el service
export class NewService {
  constructor(private repository: NewRepository) {}
  
  async getData() {
    return this.repository.findAll()
  }
}

// 2. Registrar en el DI Container
const newService = new NewService(newRepo)
this.services.set('NewService', newService)
```

### Crear un nuevo Hook:

```typescript
import { useQuery } from '@tanstack/react-query'
import { container } from '@/src/core/di'

export function useNewData() {
  const service = container.get<NewService>('NewService')
  
  return useQuery({
    queryKey: ['new-data'],
    queryFn: () => service.getData(),
  })
}
```

## 🧪 Testing

La arquitectura facilita el testing:

```typescript
// Mock del HTTP Client
const mockHttpClient: IHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

// Crear service con mock
const service = new ProfessionalsService(
  new ProfessionalsRepository(mockHttpClient)
)

// Test
mockHttpClient.get.mockResolvedValue([{ id: '1', name: 'Test' }])
const result = await service.getMyProfiles()
expect(result).toHaveLength(1)
```

## 🚀 Migración Gradual

El código legacy sigue funcionando:
- `apiClient` ahora usa el DI Container internamente
- Los hooks antiguos siguen disponibles
- Migra gradualmente a los nuevos hooks y servicios

## 📚 Beneficios

✅ **Testeable**: Fácil de mockear y testear
✅ **Mantenible**: Código organizado y predecible
✅ **Escalable**: Fácil agregar nuevas features
✅ **Flexible**: Cambiar implementaciones sin romper nada
✅ **Type-safe**: TypeScript en toda la arquitectura
✅ **Desacoplado**: Componentes independientes

## 🎯 Próximos Pasos

1. Migrar hooks legacy a los nuevos hooks SOLID
2. Agregar tests unitarios para services y repositories
3. Implementar error handling centralizado
4. Agregar logging y monitoring
5. Documentar APIs internas
