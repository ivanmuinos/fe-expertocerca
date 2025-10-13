# ExpertoCerca

Conecta con profesionales de oficios verificados cerca de ti.

## 🎯 Descripción

ExpertoCerca es una plataforma que conecta a usuarios con profesionales calificados en diversos oficios como electricistas, plomeros, carpinteros y más. Encuentra expertos verificados para tus proyectos del hogar.

## ✨ Nueva Arquitectura SOLID

**¡El proyecto ha sido refactorizado siguiendo principios SOLID!** 🎉

- ✅ Código más limpio y mantenible
- ✅ Fácil de testear y extender
- ✅ Dependency Injection Container
- ✅ Separación clara de responsabilidades
- ✅ Todo el código legacy sigue funcionando

### 📚 Documentación de Arquitectura

- **[🚀 QUICK_START.md](./QUICK_START.md)** - Empieza aquí (5 min)
- **[📖 SOLID_REFACTOR.md](./SOLID_REFACTOR.md)** - Resumen de cambios
- **[🏗️ ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura completa
- **[🔄 MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guía de migración
- **[💻 examples/USAGE_EXAMPLES.tsx](./examples/USAGE_EXAMPLES.tsx)** - Ejemplos de código

### 🎣 Uso Rápido

```typescript
// En componentes React
import { useMyProfessionalProfiles, useUserProfile } from '@/src/shared/hooks'

function MyComponent() {
  const { profiles, isLoading } = useMyProfessionalProfiles()
  const { profile } = useUserProfile()
  return <div>...</div>
}

// En Server Components / API Routes
import { container } from '@/src/core/di'

async function ServerComponent() {
  const service = container.getProfessionalsService()
  const data = await service.getMyProfiles()
  return <div>...</div>
}
```

## 🛠️ Tecnologías

- **Next.js 15** - Framework React
- **TypeScript** - Type safety
- **React Query** - Data fetching y cache
- **Supabase** - Backend y autenticación
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Zustand** - State management
- **Zod** - Validación de schemas

## 📦 Instalación

```sh
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la build
npm run preview

# Ejecutar linter
npm run lint
```

## 📁 Estructura del Proyecto

```
src/
├── core/                    # ⭐ Núcleo de la aplicación (SOLID)
│   ├── interfaces/         # Contratos e interfaces
│   ├── repositories/       # Acceso a datos
│   ├── services/           # Lógica de negocio
│   └── di/                 # Dependency Injection Container
│
├── infrastructure/         # ⭐ Implementaciones concretas
│   ├── http/              # Cliente HTTP (Fetch)
│   └── supabase/          # Auth Provider
│
├── features/              # Features por dominio
│   ├── auth/             # Autenticación
│   ├── professionals/    # Profesionales
│   ├── publications/     # Publicaciones
│   └── user-profile/     # Perfil de usuario
│
├── shared/               # Código compartido
│   ├── components/      # Componentes UI
│   ├── hooks/          # React hooks
│   └── lib/            # Utilidades
│
└── app/                 # Next.js App Router
    ├── api/            # API Routes
    └── (pages)/        # Páginas
```

## 🎯 Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo (puerto 3000)
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta el linter

## 🏗️ Arquitectura SOLID

### Principios Aplicados

1. **Single Responsibility** - Cada clase tiene una única responsabilidad
2. **Open/Closed** - Extensible sin modificar código existente
3. **Liskov Substitution** - Implementaciones intercambiables
4. **Interface Segregation** - Interfaces específicas
5. **Dependency Inversion** - Dependencias de abstracciones

### Capas de la Aplicación

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

## 🧪 Testing

La arquitectura facilita el testing con mocks:

```typescript
import { ProfessionalsService } from '@/src/core/services'
import { IHttpClient } from '@/src/core/interfaces'

const mockHttpClient: IHttpClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}

const service = new ProfessionalsService(
  new ProfessionalsRepository(mockHttpClient)
)
```

## 🚀 Deployment

El proyecto está optimizado para deployment en Vercel:

```sh
npm run build
npm run start
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. Sigue los principios SOLID establecidos
4. Usa los hooks y servicios del DI Container
5. Commit tus cambios (`git commit -m 'Añade nueva característica'`)
6. Push a la rama (`git push origin feature/nueva-caracteristica`)
7. Abre un Pull Request

### Guías para Contribuir

- Lee [ARCHITECTURE.md](./ARCHITECTURE.md) para entender la estructura
- Usa [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) para patrones
- Revisa [examples/USAGE_EXAMPLES.tsx](./examples/USAGE_EXAMPLES.tsx) para ejemplos

## 📄 Licencia

Este proyecto es privado y confidencial.

---

**¿Nuevo en el proyecto?** Empieza con [QUICK_START.md](./QUICK_START.md) 🚀