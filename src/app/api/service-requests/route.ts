import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/src/config/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const status = searchParams.get('status') || 'open';

    let query = supabase
      .from('service_requests')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (city) {
      query = query.eq('location_city', city);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Flatten profile data
    const requests = data?.map((req: any) => ({
      ...req,
      profile_full_name: req.profiles?.full_name,
      profile_avatar_url: req.profiles?.avatar_url,
      profiles: undefined,
    }));

    return NextResponse.json({ data: requests || [] });
  } catch (error: any) {
    console.error('Error fetching service requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
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
      photos = [],
    } = body;

    // Validate required fields
    if (!category || !title || !description || !location_city || !location_province) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for insertion
    // We have already verified the user above
    const adminSupabase = createSupabaseAdminClient();

    const { data, error } = await adminSupabase
      .from('service_requests')
      .insert({
        user_id: user.id,
        category,
        title,
        description,
        contact_phone,
        contact_email,
        location_city,
        location_province,
        photos,
        status: 'open',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Error creating service request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service request' },
      { status: 500 }
    );
  }
}
