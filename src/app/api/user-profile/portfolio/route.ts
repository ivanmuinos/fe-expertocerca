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

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      userId: session.user.id
    })

    // Upload file to Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${session.user.id}/${Date.now()}.${fileExt}`

    console.log('Uploading to path:', fileName)

    const { error: uploadError } = await supabase.storage
      .from('portfolio')
      .upload(fileName, file)

    if (uploadError) {
      console.error('File upload error:', uploadError)
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
      console.error('Database insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data: data[0] })
  } catch (error) {
    console.error('Portfolio upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}