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
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  console.log(`[SERVER ${requestId}] === PORTFOLIO UPLOAD START ===`);
  console.log(`[SERVER ${requestId}] 1. POST request received`, {
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: {
      contentType: request.headers.get('content-type'),
      userAgent: request.headers.get('user-agent'),
    }
  });

  try {
    const supabase = await createSupabaseServerClient()
    console.log(`[SERVER ${requestId}] 2. Supabase client created`);

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    console.log(`[SERVER ${requestId}] 3. Session checked`, {
      hasSession: !!session,
      userId: session?.user?.id
    });

    if (!session) {
      console.log(`[SERVER ${requestId}] 3.ERROR No session - Unauthorized`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Handle FormData for file uploads
    console.log(`[SERVER ${requestId}] 4. Parsing FormData...`);
    const formData = await request.formData()
    console.log(`[SERVER ${requestId}] 5. FormData parsed`, {
      keys: Array.from(formData.keys())
    });

    const file = formData.get('file') as File
    const professionalProfileId = formData.get('professional_profile_id') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    console.log(`[SERVER ${requestId}] 6. FormData values extracted`, {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      professionalProfileId,
      title,
      description
    });

    if (!file) {
      console.log(`[SERVER ${requestId}] 6.ERROR No file provided`);
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload file to Supabase Storage
    // Sanitize filename to avoid special characters
    const originalFileName = file.name;
    const fileExt = originalFileName.split('.').pop()?.toLowerCase() || 'jpg';
    // Remove special characters and spaces from extension
    const sanitizedExt = fileExt.replace(/[^a-z0-9]/gi, '');
    const fileName = `${session.user.id}/${Date.now()}.${sanitizedExt}`
    console.log(`[SERVER ${requestId}] 7. Uploading to Supabase Storage`, {
      originalFileName,
      fileName,
      fileExt,
      sanitizedExt,
      bucket: 'portfolio'
    });

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file)

    if (uploadError) {
      console.error(`[SERVER ${requestId}] 7.ERROR Upload to storage failed`, {
        error: uploadError.message,
        details: uploadError
      });
      return NextResponse.json({
        error: 'Error uploading file',
        details: uploadError.message
      }, { status: 400 })
    }

    console.log(`[SERVER ${requestId}] 8. File uploaded successfully to storage`);

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('portfolio')
      .getPublicUrl(fileName)

    console.log(`[SERVER ${requestId}] 9. Public URL generated`, {
      publicUrl: urlData.publicUrl
    });

    // Save portfolio item to database
    console.log(`[SERVER ${requestId}] 10. Inserting into database...`);
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
      console.error(`[SERVER ${requestId}] 10.ERROR Database insert failed`, {
        error: error.message,
        details: error
      });
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log(`[SERVER ${requestId}] 11. Database insert successful`, {
      photoId: data[0]?.id,
      imageUrl: data[0]?.image_url
    });

    console.log(`[SERVER ${requestId}] 12. SUCCESS - Returning response`);
    console.log(`[SERVER ${requestId}] === PORTFOLIO UPLOAD END ===`);
    return NextResponse.json({ data: data[0] })
  } catch (error) {
    console.error(`[SERVER ${requestId}] EXCEPTION - Unexpected error`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    console.log(`[SERVER ${requestId}] === PORTFOLIO UPLOAD END (ERROR) ===`);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
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