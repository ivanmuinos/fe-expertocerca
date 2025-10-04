import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

export async function GET() {
  try {
    console.log("API: my-profiles GET called"); // Debug log
    const supabase = await createSupabaseServerClient();

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.log("API: Unauthorized - no session"); // Debug log
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("API: User ID:", session.user.id); // Debug log

    // Get professional profiles for current user with their work zones
    const { data: profiles, error: profilesError } = await supabase
      .from("professional_profiles")
      .select(
        `
        id,
        trade_name,
        description,
        years_experience,
        hourly_rate,
        whatsapp_phone,
        work_phone,
        user_id,
        main_portfolio_image,
        specialty,
        created_at,
        updated_at,
        location_city,
        location_province,
        professional_work_zones (
          work_zone_id,
          work_zones (
            id,
            name
          )
        )
      `
      )
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.log("API: Profiles error:", profilesError); // Debug log
      return NextResponse.json(
        { error: "Failed to load profiles" },
        { status: 500 }
      );
    }

    console.log("API: Found profiles:", profiles?.length || 0); // Debug log

    // Get profile data for the current user (optional)
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("user_id", session.user.id)
      .maybeSingle();

    // If no profile exists, use default values
    const defaultProfileData = {
      full_name: null,
      avatar_url: null,
    };

    const finalProfileData = profileData || defaultProfileData;

    // Map the data to include profile information and work zones at the top level
    const mappedProfiles = (profiles || []).map((prof) => {
      // Get work zone from the professional_work_zones relationship
      const workZones = (prof as any).professional_work_zones || [];
      const workZone = workZones[0]?.work_zones || null;

      return {
        id: prof.id,
        trade_name: prof.trade_name,
        description: prof.description,
        years_experience: prof.years_experience,
        hourly_rate: prof.hourly_rate,
        whatsapp_phone: prof.whatsapp_phone,
        work_phone: prof.work_phone,
        user_id: prof.user_id,
        main_portfolio_image: (prof as any).main_portfolio_image || null,
        specialty: (prof as any).specialty || null,
        profile_full_name: finalProfileData.full_name,
        // Each publication has its own location saved on professional_profiles
        profile_location_city:
          (prof as any).location_city || workZone?.name || null,
        profile_location_province: (prof as any).location_province || null,
        profile_skills: [],
        profile_avatar_url: finalProfileData.avatar_url,
        work_zone_id: workZone?.id || null,
        work_zone_name: workZone?.name || null,
        created_at: prof.created_at,
        updated_at: prof.updated_at,
      };
    });

    console.log("API: Returning mapped profiles:", mappedProfiles.length); // Debug log
    return NextResponse.json({ data: mappedProfiles });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get("id");

    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("professional_profiles")
      .delete()
      .eq("id", profileId)
      .eq("user_id", session.user.id); // Ensure user can only delete their own profiles

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
