import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/src/config/supabase-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Service request not found' },
        { status: 404 }
      );
    }

    // Flatten profile data
    const request = {
      ...data,
      profile_full_name: data.profiles?.full_name,
      profile_avatar_url: data.profiles?.avatar_url,
      profiles: undefined,
    };

    return NextResponse.json({ data: request });
  } catch (error: any) {
    console.error('Error fetching service request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service request' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      category,
      title,
      description,
      contact_phone,
      contact_email,
      location_city,
      location_province,
      photos,
      status,
    } = body;

    // Use admin client to bypass RLS
    const adminSupabase = createSupabaseAdminClient();

    // First verify ownership
    const { data: existing, error: fetchError } = await adminSupabase
      .from('service_requests')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this request' },
        { status: 403 }
      );
    }

    const { data, error } = await adminSupabase
      .from('service_requests')
      .update({
        category,
        title,
        description,
        contact_phone,
        contact_email,
        location_city,
        location_province,
        photos,
        status,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error updating service request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service request' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const adminSupabase = createSupabaseAdminClient();

    // First verify ownership
    const { data: existing, error: fetchError } = await adminSupabase
      .from('service_requests')
      .select('user_id')
      .eq('id', params.id)
      .single();

    if (fetchError) throw fetchError;

    if (!existing || existing.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this request' },
        { status: 403 }
      );
    }

    const { error } = await adminSupabase
      .from('service_requests')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ data: { success: true } });
  } catch (error: any) {
    console.error('Error deleting service request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service request' },
      { status: 500 }
    );
  }
}
