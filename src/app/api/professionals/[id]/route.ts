import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createSupabaseAdminClient } from "@/src/config/supabase-server";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    // Use admin client to bypass RLS for public profile viewing
    const adminClient = createSupabaseAdminClient();

    // Fetch professional profile
    const { data: prof, error: profError } = await adminClient
      .from("professional_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (profError) {
      console.error("Supabase error (professional_profiles):", profError);
      return NextResponse.json({ error: profError.message }, { status: 400 });
    }

    if (!prof) {
      return NextResponse.json(
        { error: "Professional not found" },
        { status: 404 }
      );
    }

    // Fetch profile row
    const { data: profileRow, error: profileError } = await adminClient
      .from("profiles")
      .select("full_name, avatar_url, location_city, location_province, whatsapp_phone, phone")
      .eq("user_id", prof.user_id)
      .single();

    if (profileError) {
      console.error('[API] Error fetching profile:', profileError);
    }
    console.log('[API] Profile row:', profileRow);

    // Get user metadata separately (from auth.users)
    let userMetadata = null;
    try {
      const { data: userData } = await adminClient.auth.admin.getUserById(
        prof.user_id
      );
      userMetadata = userData?.user?.user_metadata;
      console.log('[API] User metadata:', userMetadata);
    } catch (userError) {
      console.log("Could not fetch user metadata:", userError);
    }

    // Format the response to match the expected structure
    // Use user_metadata as fallback for missing profile data
    // Use whatsapp_phone and phone from profiles table (source of truth)
    const professional = {
      id: prof.id,
      trade_name: prof.trade_name,
      description: prof.description,
      specialty: prof.specialty,
      years_experience: prof.years_experience,
      user_id: prof.user_id,
      profile_full_name: profileRow?.full_name || userMetadata?.name || userMetadata?.full_name || null,
      profile_location_city: profileRow?.location_city || null,
      profile_location_province: profileRow?.location_province || null,
      profile_skills: null, // Column doesn't exist yet in database
      profile_avatar_url: profileRow?.avatar_url || userMetadata?.avatar_url || userMetadata?.picture || null,
      main_portfolio_image: prof.main_portfolio_image,
      hourly_rate: prof.hourly_rate,
      has_contact_info: profileRow?.whatsapp_phone ? true : false,
      whatsapp_phone: profileRow?.whatsapp_phone || null,
      phone: profileRow?.phone || null,
      user_metadata: userMetadata,
    };

    return NextResponse.json({ data: professional });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication (use getUser to ensure authenticity)
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Verify ownership
    const { data: profile } = await supabase
      .from("professional_profiles")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("professional_profiles")
      .update(body)
      .eq("id", id)
      .select();

    if (error) {
      console.error("Update error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: data[0] });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { id } = await params;
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify ownership
    const { data: profile } = await supabase
      .from("professional_profiles")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!profile || profile.user_id !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error } = await supabase
      .from("professional_profiles")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
