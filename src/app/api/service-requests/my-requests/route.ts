import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/src/config/supabase-server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

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
    console.error('Error fetching my service requests:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}
