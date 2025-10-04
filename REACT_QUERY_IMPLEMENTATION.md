# 🚀 Implementación de React Query - Guía Completa

## 💰 Impacto Esperado

- **Reducción de Database Reads**: 80-90%
- **Ahorro mensual**: ~$28/mes (1000 users) o $280/mes (10K users)
- **Mejora UX**: Data instantánea, offline-first
- **Tiempo de implementación**: 1-2 días

---

## 📦 Instalación

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

---

## 🏗️ Setup Inicial

### 1. Crear Query Client Provider

**Archivo**: `src/app/providers.tsx` (ya existe, actualizar)

```typescript
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Tiempo de cache (5 minutos)
            staleTime: 5 * 60 * 1000,
            // Tiempo antes de garbage collection (10 minutos)
            gcTime: 10 * 60 * 1000,
            // Retry en caso de error
            retry: 1,
            // Refetch en window focus (desactivar si es molesto)
            refetchOnWindowFocus: false,
            // Refetch cuando se monta el componente
            refetchOnMount: true,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 2. Wrap App con Provider

**Archivo**: `src/app/layout.tsx`

```typescript
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

## 🎯 Implementación por Módulo

### 1. Home Page - Professionals List

**Antes** (`src/app/page.tsx`):

```typescript
const loadProfessionals = useCallback(async () => {
  const { data, error } = user
    ? await browseProfessionals()
    : await discoverProfessionals();

  if (error) {
    /* handle error */
  }
  setProfessionals(data || []);
}, [user, browseProfessionals, discoverProfessionals]);

useEffect(() => {
  loadProfessionals();
}, [loadProfessionals]);
```

**Después**:

```typescript
import { useQuery } from "@tanstack/react-query";

const {
  data: professionals = [],
  isLoading,
  error,
} = useQuery({
  queryKey: ["professionals", user ? "browse" : "discover"],
  queryFn: async () => {
    const { data, error } = user
      ? await browseProfessionals()
      : await discoverProfessionals();

    if (error) throw new Error(error);
    return data || [];
  },
  staleTime: 5 * 60 * 1000, // 5 minutes cache
});
```

**Beneficio**:

- ✅ Cache automático por 5 minutos
- ✅ No refetch innecesarios
- ✅ Loading state incluido
- ✅ Reducción de ~90% de requests

---

### 2. Profile Page

**Archivo**: `src/app/perfil/page.tsx`

**Antes**:

```typescript
const loadProfile = async () => {
  const response = await fetch("/api/profile");
  const { data } = await response.json();
  setFormData(data);
};

useEffect(() => {
  if (user) loadProfile();
}, [user]);
```

**Después**:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query para cargar profile
const { data: profile, isLoading } = useQuery({
  queryKey: ["profile", user?.id],
  queryFn: async () => {
    const response = await fetch("/api/profile");
    if (!response.ok) throw new Error("Failed to load profile");
    const { data } = await response.json();
    return data;
  },
  enabled: !!user, // Solo fetch si user existe
  staleTime: 10 * 60 * 1000, // 10 minutes (profile no cambia seguido)
});

// Mutation para actualizar profile
const queryClient = useQueryClient();
const updateProfileMutation = useMutation({
  mutationFn: async (updates: any) => {
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error("Failed to update");
    return response.json();
  },
  onSuccess: () => {
    // Invalidar cache para refetch
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast({ title: "Perfil actualizado" });
  },
});

// Usar
const handleSave = () => {
  updateProfileMutation.mutate({
    phone: formData.phone,
    whatsapp_phone: formData.whatsapp_phone,
  });
};
```

**Beneficio**:

- ✅ Cache de profile (no refetch en cada visita)
- ✅ Optimistic updates posibles
- ✅ Loading states automáticos
- ✅ Reducción de ~95% de requests (profile se accede mucho)

---

### 3. My Publications

**Archivo**: `src/app/mis-publicaciones/page.tsx`

**Después**:

```typescript
const {
  data: publications = [],
  isLoading,
  refetch,
} = useQuery({
  queryKey: ["my-publications", user?.id],
  queryFn: async () => {
    const response = await fetch("/api/my-profiles");
    const { data } = await response.json();
    return data || [];
  },
  enabled: !!user,
  staleTime: 2 * 60 * 1000, // 2 minutes (puede cambiar frecuentemente)
});

// Delete mutation
const deletePublicationMutation = useMutation({
  mutationFn: async (id: string) => {
    const response = await fetch(`/api/my-profiles/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete");
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["my-publications"] });
    toast({ title: "Publicación eliminada" });
  },
});
```

---

### 4. Publication Detail Page

**Archivo**: `src/app/publication/page.tsx`

```typescript
const { data: professional, isLoading } = useQuery({
  queryKey: ["professional", id],
  queryFn: async () => {
    const response = await fetch(`/api/professionals/${id}`);
    const { data } = await response.json();
    return data;
  },
  enabled: !!id,
  staleTime: 10 * 60 * 1000, // 10 minutes
});
```

---

### 5. Portfolio Photos

**Archivo**: `src/shared/components/PortfolioSection.tsx`

```typescript
const {
  data: photos = [],
  isLoading,
  refetch,
} = useQuery({
  queryKey: ["portfolio", professionalProfileId],
  queryFn: async () => {
    const response = await fetch(
      `/api/user-profile/portfolio?professionalProfileId=${professionalProfileId}`
    );
    const { data } = await response.json();
    return data || [];
  },
  enabled: !!professionalProfileId,
  staleTime: 5 * 60 * 1000,
});

// Upload mutation
const uploadPhotoMutation = useMutation({
  mutationFn: async (formData: FormData) => {
    const response = await fetch("/api/user-profile/portfolio", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["portfolio"] });
  },
});
```

---

### 6. Reviews

**Archivo**: `src/shared/components/ReviewsSection.tsx`

```typescript
const { data: reviews = [], isLoading } = useQuery({
  queryKey: ["reviews", professionalProfileId],
  queryFn: async () => {
    const response = await fetch(
      `/api/user-profile/reviews?professionalProfileId=${professionalProfileId}`
    );
    const { data } = await response.json();
    return data || [];
  },
  enabled: !!professionalProfileId,
  staleTime: 10 * 60 * 1000, // Reviews no cambian frecuentemente
});

// Average rating query (separado para cache independiente)
const { data: averageRating } = useQuery({
  queryKey: ["reviews-average", professionalProfileId],
  queryFn: async () => {
    const response = await fetch(
      `/api/user-profile/reviews?professionalProfileId=${professionalProfileId}&averageOnly=true`
    );
    const { data } = await response.json();
    return data?.average || 0;
  },
  enabled: !!professionalProfileId,
  staleTime: 15 * 60 * 1000, // 15 minutes
});
```

---

## 🎨 Query Keys Strategy

**Estructura recomendada**:

```typescript
// Hierarchical keys para invalidación granular
const queryKeys = {
  // Profile
  profile: ["profile"] as const,
  profileById: (userId: string) => ["profile", userId] as const,

  // Professionals
  professionals: ["professionals"] as const,
  professionalsList: (type: "browse" | "discover") =>
    ["professionals", type] as const,
  professionalDetail: (id: string) => ["professionals", id] as const,

  // Portfolio
  portfolio: ["portfolio"] as const,
  portfolioByProfile: (profileId: string) => ["portfolio", profileId] as const,

  // Reviews
  reviews: ["reviews"] as const,
  reviewsByProfile: (profileId: string) => ["reviews", profileId] as const,
  reviewsAverage: (profileId: string) =>
    ["reviews-average", profileId] as const,

  // My Publications
  myPublications: ["my-publications"] as const,
  myPublicationsByUser: (userId: string) =>
    ["my-publications", userId] as const,
};

// Uso:
useQuery({
  queryKey: queryKeys.professionalDetail(id),
  // ...
});

// Invalidación granular:
queryClient.invalidateQueries({ queryKey: queryKeys.professionals });
// Invalida TODOS los professionals

queryClient.invalidateQueries({ queryKey: queryKeys.professionalDetail(id) });
// Invalida SOLO ese professional
```

---

## 🚀 Features Avanzadas

### 1. Optimistic Updates

```typescript
const updateProfileMutation = useMutation({
  mutationFn: updateProfile,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ["profile"] });

    // Snapshot previous value
    const previousProfile = queryClient.getQueryData(["profile"]);

    // Optimistically update
    queryClient.setQueryData(["profile"], (old: any) => ({
      ...old,
      ...newData,
    }));

    return { previousProfile };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(["profile"], context?.previousProfile);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  },
});
```

### 2. Prefetching

```typescript
// Prefetch en hover para mejor UX
const prefetchProfessional = (id: string) => {
  queryClient.prefetchQuery({
    queryKey: ["professional", id],
    queryFn: () => fetch(`/api/professionals/${id}`).then((r) => r.json()),
  });
};

// Uso en card
<div onMouseEnter={() => prefetchProfessional(prof.id)}>
  {/* Card content */}
</div>;
```

### 3. Infinite Queries (Paginación)

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["professionals", "infinite"],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(
        `/api/professionals?page=${pageParam}&limit=20`
      );
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
  });

// Render
<InfiniteScroll
  loadMore={fetchNextPage}
  hasMore={hasNextPage}
  loading={isFetchingNextPage}
>
  {data?.pages.map((page) =>
    page.items.map((item) => <Card key={item.id} {...item} />)
  )}
</InfiniteScroll>;
```

---

## 📊 Monitoreo y Debug

### React Query Devtools

Ya incluido en setup. Abre en browser:

- Ver todas las queries activas
- Ver cache state
- Ver staleness
- Invalidar manualmente
- Ver network requests

### Métricas a Observar

**Antes de React Query**:

```
Home page visit:
- 1 request to /api/professionals (500ms)
- Return visit: 1 request (500ms) ❌

Profile page:
- 1 request to /api/profile (300ms)
- Each navigation back: 1 request (300ms) ❌

Total: ~10-20 requests/user session
```

**Después de React Query**:

```
Home page visit:
- 1 request to /api/professionals (500ms)
- Return visit (< 5 min): 0 requests (instant) ✅

Profile page:
- 1 request to /api/profile (300ms)
- Return visit (< 10 min): 0 requests (instant) ✅

Total: ~2-3 requests/user session
```

**Reducción**: 80-90% 🎉

---

## ✅ Checklist de Implementación

- [ ] Instalar `@tanstack/react-query`
- [ ] Crear `QueryClientProvider` en `providers.tsx`
- [ ] Wrap app en `layout.tsx`
- [ ] Migrar Home page (`src/app/page.tsx`)
- [ ] Migrar Profile page (`src/app/perfil/page.tsx`)
- [ ] Migrar My Publications (`src/app/mis-publicaciones/page.tsx`)
- [ ] Migrar Publication Detail (`src/app/publication/page.tsx`)
- [ ] Migrar Portfolio Section (`src/shared/components/PortfolioSection.tsx`)
- [ ] Migrar Reviews Section (`src/shared/components/ReviewsSection.tsx`)
- [ ] Implementar mutations para updates
- [ ] Configurar query keys structure
- [ ] Testear cache funcionando (visitar página 2 veces)
- [ ] Testear invalidación (hacer update, ver refetch)
- [ ] Monitorear Supabase dashboard (ver reducción de reads)

---

## 🎯 Orden Sugerido de Implementación

1. **Día 1 - Setup y Core Pages**:

   - Setup QueryClient
   - Home page
   - Profile page
   - Testear básico

2. **Día 2 - Mutations y Detail Pages**:

   - My Publications
   - Publication Detail
   - Portfolio Section
   - Reviews Section
   - Implementar mutations
   - Testear completo

3. **Día 3 - Polish** (opcional):
   - Optimistic updates
   - Prefetching
   - Infinite queries (si implementas paginación)
   - Performance testing

---

**Resultado Final**:

- ✅ 80-90% menos requests
- ✅ UX instantánea
- ✅ ~$28/mes ahorro (1K users)
- ✅ Escalable a 10K+ users
