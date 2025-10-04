import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/src/config/supabase-server'

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('portfolio_photos')
      .select('*')
      .eq('professional_profile_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle FormData for file uploads
    const formData = await request.formData()
    const file = formData.get('file') as File
    const professionalProfileId = formData.get('professional_profile_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }


    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file)

    if (uploadError) {
      return NextResponse.json({
        error: 'Error uploading file',
        details: uploadError.message
      }, { status: 400 })
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(fileName)

    // Save portfolio item to database
    const { data, error } = await supabase
      .from('portfolio_photos')
      .insert([{
        professional_profile_id: professionalProfileId,
        title: title || 'Foto de trabajo',
        description: description || '',
        image_url: urlData.publicUrl
      }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('id')
    const imageUrl = searchParams.get('imageUrl')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 })
    }

    console.log('[DELETE] Attempting to delete photo:', photoId)

    // Get photo first to get image_url and verify it exists
    const { data: photo, error: fetchError } = await supabase
      .from('portfolio_photos')
      .select('image_url, professional_profile_id')
      .eq('id', photoId)
      .single()

    if (fetchError) {
      console.error('[DELETE] Error fetching photo:', fetchError)
      return NextResponse.json({ error: 'Photo not found', details: fetchError.message }, { status: 404 })
    }

    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    console.log('[DELETE] Photo found:', photo)

    // Verify ownership through professional_profiles
    const { data: profile } = await supabase
      .from('professional_profiles')
      .select('user_id')
      .eq('id', photo.professional_profile_id)
      .single()

    if (!profile || profile.user_id !== session.user.id) {
      console.error('[DELETE] Ownership verification failed')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    console.log('[DELETE] Ownership verified')

    // Delete from storage
    const urlToUse = imageUrl || photo.image_url
    if (urlToUse) {
      let filePath: string | null = null
      const match = urlToUse.match(/\/storage\/v1\/object\/public\/portfolio\/(.+)$/)

      if (match && match[1]) {
        filePath = match[1]
      } else {
        const parts = urlToUse.split('/portfolio/')
        if (parts.length === 2) {
          filePath = parts[1].replace(/^public\//, '')
        }
      }

      if (filePath) {
        console.log('[DELETE] Deleting from storage:', filePath)
        const { error: storageError } = await supabase.storage
          .from('portfolio')
          .remove([filePath])

        if (storageError) {
          console.error('[DELETE] Storage error:', storageError)
        }
      }
    }

    // Delete from database - RLS policy will handle ownership check
    console.log('[DELETE] Deleting from database')
    const { error: deleteError } = await supabase
      .from('portfolio_photos')
      .delete()
      .eq('id', photoId)

    if (deleteError) {
      console.error('[DELETE] Database error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    console.log('[DELETE] Successfully deleted photo')
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: any) {
    console.error('[DELETE] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}