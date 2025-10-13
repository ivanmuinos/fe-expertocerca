# 🏗️ Diagrama de Arquitectura SOLID

## 📊 Vista General

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                    (Components, Pages, Hooks)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Client     │  │    Server    │  │  API Routes  │          │
│  │  Components  │  │  Components  │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         ▼                  ▼                  ▼                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  React Hooks │  │   Services   │  │   Services   │          │
│  │ (use-*.tsx)  │  │  (Direct)    │  │  (Direct)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
└─────────┼──────────────────┼──────────────────┼───────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                            ▼                                     │
│                   DEPENDENCY INJECTION                           │
│                        CONTAINER                                 │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  container.getProfessionalsService()                    │    │
│  │  container.getUserProfileService()                      │    │
│  │  container.getAuthService()                             │    │
│  │  container.get*Repository()                             │    │
│  │  container.getHttpClient()                              │    │
│  └────────────────────────────────────────────────────────┘    │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
          ┌──────────────────┴──────────────────┐
          │                                     │
          ▼                                     ▼
┌─────────────────────┐              ┌─────────────────────┐
│   BUSINESS LOGIC    │              │   DATA ACCESS       │
│      (Services)     │              │   (Repositories)    │
├─────────────────────┤              ├─────────────────────┤
│                     │              │                     │
│ ProfessionalsService│──────────────│ProfessionalsRepo    │
│ UserProfileService  │──────────────│UserProfileRepo      │
│ AuthService         │──────────────│PortfolioRepo        │
│                     │              │ReviewsRepo          │
│                     │              │OnboardingRepo       │
└─────────────────────┘              └──────────┬──────────┘
                                                │
                                                ▼
                                     ┌─────────────────────┐
                                     │  INFRASTRUCTURE     │
                                     │   (HTTP Client)     │
                                     ├─────────────────────┤
                                     │                     │
                                     │  FetchHttpClient    │
                                     │  (IHttpClient)      │
                                     │                     │
                                     └──────────┬──────────┘
                                                │
                                                ▼
                                     ┌─────────────────────┐
                                     │    EXTERNAL API     │
                                     │   (Next.js Routes)  │
                                     └─────────────────────┘
```

## 🔄 Flujo de Datos Detallado

### 1. Client Component Flow

```
User Interaction
      │
      ▼
┌─────────────────┐
│  Component      │  'use client'
│  (React)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Hook           │  useMyProfessionalProfiles()
│  (React Query)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DI Container   │  container.getProfessionalsService()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service        │  ProfessionalsService
│  (Business)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │  ProfessionalsRepository
│  (Data Access)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Client    │  FetchHttpClient
│  (Infrastructure)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │  /api/professionals
└─────────────────┘
```

### 2. Server Component Flow

```
Server Render
      │
      ▼
┌─────────────────┐
│  Server         │  async function
│  Component      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DI Container   │  container.getProfessionalsService()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service        │  ProfessionalsService
│  (Business)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │  ProfessionalsRepository
│  (Data Access)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HTTP Client    │  FetchHttpClient
│  (Infrastructure)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Route      │  /api/professionals
└─────────────────┘
```

### 3. API Route Flow

```
HTTP Request
      │
      ▼
┌─────────────────┐
│  API Route      │  export async function GET()
│  Handler        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  DI Container   │  container.getProfessionalsService()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Service        │  ProfessionalsService
│  (Business)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Repository     │  ProfessionalsRepository
│  (Data Access)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Supabase       │  Direct DB Access
│  Client         │
└─────────────────┘
```

## 🎯 Capas de la Arquitectura

### Layer 1: Presentation (UI)
```
┌─────────────────────────────────────────┐
│  Components, Pages, Hooks               │
│  - React Components                     │
│  - Next.js Pages                        │
│  - Custom Hooks                         │
│  - UI Logic                             │
└─────────────────────────────────────────┘
```

### Layer 2: Application (Business Logic)
```
┌─────────────────────────────────────────┐
│  Services                               │
│  - ProfessionalsService                 │
│  - UserProfileService                   │
│  - AuthService                          │
│  - Business Rules                       │
│  - Validation                           │
└─────────────────────────────────────────┘
```

### Layer 3: Domain (Data Access)
```
┌─────────────────────────────────────────┐
│  Repositories                           │
│  - ProfessionalsRepository              │
│  - UserProfileRepository                │
│  - PortfolioRepository                  │
│  - ReviewsRepository                    │
│  - Data Mapping                         │
└─────────────────────────────────────────┘
```

### Layer 4: Infrastructure (External)
```
┌─────────────────────────────────────────┐
│  HTTP Client, Auth Provider             │
│  - FetchHttpClient                      │
│  - SupabaseAuthProvider                 │
│  - External APIs                        │
│  - Database                             │
└─────────────────────────────────────────┘
```

## 🔌 Dependency Injection

```
┌─────────────────────────────────────────────────────────┐
│                   DI CONTAINER                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Infrastructure Layer                                   │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ FetchHttpClient │  │SupabaseAuth     │             │
│  │  (IHttpClient)  │  │  Provider       │             │
│  └────────┬────────┘  └────────┬────────┘             │
│           │                     │                       │
│           └──────────┬──────────┘                       │
│                      │                                  │
│  Repository Layer    ▼                                  │
│  ┌──────────────────────────────────────┐              │
│  │  ProfessionalsRepository             │              │
│  │  UserProfileRepository               │              │
│  │  PortfolioRepository                 │              │
│  │  ReviewsRepository                   │              │
│  │  OnboardingRepository                │              │
│  └────────────────┬─────────────────────┘              │
│                   │                                     │
│  Service Layer    ▼                                     │
│  ┌──────────────────────────────────────┐              │
│  │  ProfessionalsService                │              │
│  │  UserProfileService                  │              │
│  │  AuthService                         │              │
│  └──────────────────────────────────────┘              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📦 Módulos y Dependencias

```
┌─────────────────────────────────────────────────────────┐
│                      src/core/                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  interfaces/          (Contratos)                       │
│  ├── IHttpClient                                        │
│  ├── IAuthService                                       │
│  ├── IRepository<T>                                     │
│  └── IQueryRepository<T>                                │
│                                                         │
│  repositories/        (Data Access)                     │
│  ├── ProfessionalsRepository                            │
│  ├── UserProfileRepository                              │
│  ├── PortfolioRepository                                │
│  ├── ReviewsRepository                                  │
│  └── OnboardingRepository                               │
│                                                         │
│  services/            (Business Logic)                  │
│  ├── ProfessionalsService                               │
│  ├── UserProfileService                                 │
│  └── AuthService                                        │
│                                                         │
│  di/                  (Dependency Injection)            │
│  └── container.ts                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 src/infrastructure/                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  http/                                                  │
│  └── FetchHttpClient (implements IHttpClient)           │
│                                                         │
│  supabase/                                              │
│  └── SupabaseAuthProvider (implements IAuthService)     │
│                                                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   src/shared/hooks/                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  use-professionals.tsx                                  │
│  use-user-profile.tsx                                   │
│  use-portfolio.tsx                                      │
│  use-reviews.tsx                                        │
│                                                         │
│  (All hooks use DI Container internally)                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Patrones de Diseño Aplicados

### 1. Repository Pattern
```
┌─────────────────┐
│   Repository    │  Abstrae el acceso a datos
│   Interface     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Concrete       │  Implementación específica
│  Repository     │
└─────────────────┘
```

### 2. Service Layer Pattern
```
┌─────────────────┐
│    Service      │  Lógica de negocio
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  Acceso a datos
└─────────────────┘
```

### 3. Dependency Injection Pattern
```
┌─────────────────┐
│   Container     │  Gestiona dependencias
└────────┬────────┘
         │
         ├──► Service A
         ├──► Service B
         └──► Repository C
```

### 4. Adapter Pattern
```
┌─────────────────┐
│   Interface     │  IHttpClient
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fetch Adapter  │  FetchHttpClient
└─────────────────┘
```

## 🔐 Principios SOLID Visualizados

### S - Single Responsibility
```
Repository  ──► Solo acceso a datos
Service     ──► Solo lógica de negocio
Hook        ──► Solo gestión de estado
```

### O - Open/Closed
```
Interface   ──► Define contrato (cerrado)
             │
             ├──► Implementación A (abierto)
             ├──► Implementación B (abierto)
             └──► Implementación C (abierto)
```

### L - Liskov Substitution
```
IHttpClient
    │
    ├──► FetchHttpClient   ✅ Intercambiable
    ├──► AxiosHttpClient   ✅ Intercambiable
    └──► MockHttpClient    ✅ Intercambiable
```

### I - Interface Segregation
```
IRepository<T>      ──► CRUD completo
IQueryRepository<T> ──► Solo lectura
```

### D - Dependency Inversion
```
Service ──depends on──► IRepository (abstracción)
                              │
                              ▼
                        ConcreteRepository (implementación)
```

---

**Este diagrama representa la arquitectura SOLID implementada en el proyecto ExpertoCerca** 🚀
