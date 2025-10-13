/**
 * Ejemplos de Uso - Arquitectura SOLID
 * 
 * Este archivo contiene ejemplos prácticos de cómo usar
 * la nueva arquitectura en diferentes escenarios.
 */

// ============================================
// EJEMPLO 1: Componente con lista de profesionales
// ============================================

import { useMyProfessionalProfiles } from '@/src/shared/hooks'

export function ProfessionalsList() {
  const { profiles, isLoading, refetch } = useMyProfessionalProfiles()

  if (isLoading) {
    return <div>Cargando profesionales...</div>
  }

  return (
    <div>
      <h2>Mis Perfiles Profesionales</h2>
      <button onClick={() => refetch()}>Actualizar</button>
      
      {profiles.map(profile => (
        <div key={profile.id}>
          <h3>{profile.specialty}</h3>
          <p>{profile.description}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================
// EJEMPLO 2: Formulario de perfil de usuario
// ============================================

import { useUserProfile, useUpdateUserProfile } from '@/src/shared/hooks'
import { useState } from 'react'

export function UserProfileForm() {
  const { profile, isLoading } = useUserProfile()
  const updateProfile = useUpdateUserProfile()
  const [name, setName] = useState(profile?.full_name || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile.mutate({ full_name: name })
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre completo"
      />
      <button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Guardando...' : 'Guardar'}
      </button>
      
      {updateProfile.isSuccess && <p>✅ Guardado exitosamente</p>}
      {updateProfile.isError && <p>❌ Error al guardar</p>}
    </form>
  )
}

// ============================================
// EJEMPLO 3: Crear un nuevo profesional
// ============================================

import { useCreateProfessional } from '@/src/shared/hooks'
import { useRouter } from 'next/navigation'

export function CreateProfessionalForm() {
  const createProfessional = useCreateProfessional()
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await createProfessional.mutateAsync(data)
      router.push('/mis-publicaciones')
    } catch (error) {
      console.error('Error al crear perfil:', error)
    }
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      handleSubmit({
        specialty: formData.get('specialty'),
        description: formData.get('description'),
        zone: formData.get('zone'),
      })
    }}>
      <input name="specialty" placeholder="Especialidad" required />
      <textarea name="description" placeholder="Descripción" />
      <input name="zone" placeholder="Zona" />
      <button type="submit">Crear Perfil</button>
    </form>
  )
}

// ============================================
// EJEMPLO 4: Portafolio con creación de items
// ============================================

import { usePortfolio, useCreatePortfolioItem } from '@/src/shared/hooks'

export function PortfolioGallery() {
  const { items, isLoading } = usePortfolio()
  const createItem = useCreatePortfolioItem()

  const handleAddItem = () => {
    createItem.mutate({
      title: 'Nuevo trabajo',
      description: 'Descripción del trabajo',
      image_url: 'https://example.com/image.jpg'
    })
  }

  return (
    <div>
      <button onClick={handleAddItem}>Agregar Item</button>
      
      <div className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id}>
            <img src={item.image_url} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// EJEMPLO 5: Reseñas de un profesional
// ============================================

import { useReviews, useCreateReview } from '@/src/shared/hooks'

export function ReviewsSection({ professionalId }: { professionalId: string }) {
  const { reviews, isLoading } = useReviews(professionalId)
  const createReview = useCreateReview()

  const handleSubmitReview = (rating: number, comment: string) => {
    createReview.mutate({
      professional_id: professionalId,
      rating,
      comment,
    })
  }

  return (
    <div>
      <h3>Reseñas</h3>
      
      {reviews.map(review => (
        <div key={review.id}>
          <div>⭐ {review.rating}/5</div>
          <p>{review.comment}</p>
        </div>
      ))}

      <button onClick={() => handleSubmitReview(5, 'Excelente servicio!')}>
        Dejar reseña
      </button>
    </div>
  )
}

// ============================================
// EJEMPLO 6: Server Component con servicios
// ============================================

import { container } from '@/src/core/di'

export async function ProfessionalsServerList() {
  // En Server Components, usa servicios directamente
  const service = container.getProfessionalsService()
  const professionals = await service.discoverProfessionals()

  return (
    <div>
      <h2>Profesionales Disponibles</h2>
      {professionals.map(prof => (
        <div key={prof.id}>
          <h3>{prof.specialty}</h3>
          <p>{prof.zone}</p>
        </div>
      ))}
    </div>
  )
}

// ============================================
// EJEMPLO 7: API Route con servicios
// ============================================

import { container } from '@/src/core/di'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const service = container.getProfessionalsService()
    const professionals = await service.discoverProfessionals()
    
    return Response.json({
      success: true,
      data: professionals
    })
  } catch (error) {
    return Response.json({
      success: false,
      error: 'Error al obtener profesionales'
    }, { status: 500 })
  }
}

// ============================================
// EJEMPLO 8: Hook personalizado combinando múltiples servicios
// ============================================

import { useQuery } from '@tanstack/react-query'
import { container } from '@/src/core/di'

export function useProfessionalWithReviews(professionalId: string) {
  const professionalsService = container.getProfessionalsService()
  const reviewsRepo = container.getReviewsRepository()

  return useQuery({
    queryKey: ['professional-with-reviews', professionalId],
    queryFn: async () => {
      const [professional, reviews] = await Promise.all([
        professionalsService.getMyProfile(professionalId),
        reviewsRepo.findByProfessionalId(professionalId)
      ])

      return {
        professional,
        reviews,
        averageRating: reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      }
    },
    enabled: !!professionalId
  })
}

// Uso del hook personalizado
export function ProfessionalDetailPage({ id }: { id: string }) {
  const { data, isLoading } = useProfessionalWithReviews(id)

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <h1>{data?.professional?.specialty}</h1>
      <p>Rating promedio: {data?.averageRating.toFixed(1)} ⭐</p>
      <div>
        {data?.reviews.map(review => (
          <div key={review.id}>{review.comment}</div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// EJEMPLO 9: Testing con mocks
// ============================================

import { ProfessionalsService } from '@/src/core/services'
import { ProfessionalsRepository } from '@/src/core/repositories'
import { IHttpClient } from '@/src/core/interfaces'

describe('ProfessionalsService', () => {
  let service: ProfessionalsService
  let mockHttpClient: jest.Mocked<IHttpClient>

  beforeEach(() => {
    // Mock del HTTP Client
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }

    // Crear servicio con mock
    const repository = new ProfessionalsRepository(mockHttpClient)
    service = new ProfessionalsService(repository)
  })

  it('should get my profiles', async () => {
    const mockProfiles = [
      { id: '1', specialty: 'Plomero', zone: 'Norte' }
    ]
    
    mockHttpClient.get.mockResolvedValue(mockProfiles)

    const result = await service.getMyProfiles()

    expect(result).toEqual(mockProfiles)
    expect(mockHttpClient.get).toHaveBeenCalledWith('/my-profiles')
  })

  it('should create a profile', async () => {
    const newProfile = { specialty: 'Electricista', zone: 'Sur' }
    const createdProfile = { id: '2', ...newProfile }

    mockHttpClient.post.mockResolvedValue(createdProfile)

    const result = await service.createProfile(newProfile)

    expect(result).toEqual(createdProfile)
    expect(mockHttpClient.post).toHaveBeenCalledWith('/professionals', newProfile)
  })
})

// ============================================
// EJEMPLO 10: Middleware personalizado
// ============================================

import { container } from '@/src/core/di'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Verificar autenticación usando el servicio
  const authService = container.getAuthService()
  const { session } = await authService.getSession()

  if (!session && request.nextUrl.pathname.startsWith('/perfil')) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/perfil/:path*', '/mis-publicaciones/:path*']
}
