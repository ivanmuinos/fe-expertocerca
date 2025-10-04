import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

// Helper function to validate UUID format
const isValidUUID = (str: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Save to profiles table (only basic user info - NO location, that's per publication)
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        user_id: session.user.id,
        full_name: data.fullName,
        first_name: data.fullName.split(" ")[0],
        last_name: data.fullName.split(" ").slice(1).join(" "),
        phone: data.phone,
        whatsapp_phone: data.whatsappPhone,
        // location_province y location_city REMOVIDOS - cada publicación tiene su zona
        user_type: "professional", // Mark as professional
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    // Create professional profile (required fields: specialty, trade_name)
    if (data.specialty && data.tradeName) {
      // First check how many profiles the user already has
      const { count, error: countError } = await supabase
        .from("professional_profiles")
        .select("*", { count: "exact", head: true })
        .eq("user_id", session.user.id);

      if (countError) {
        return NextResponse.json(
          { error: countError.message },
          { status: 400 }
        );
      }

      // Limit to 10 profiles per user
      if (count && count >= 10) {
        return NextResponse.json(
          {
            error:
              "Has alcanzado el límite máximo de 10 publicaciones por usuario",
          },
          { status: 400 }
        );
      }

      // Always insert a new profile (no upsert)
      const { data: professionalProfile, error: professionalError } =
        await supabase
          .from("professional_profiles")
          .insert({
            user_id: session.user.id,
            specialty: data.specialty, // Required field
            trade_name: data.tradeName, // Required field
            description: data.bio, // Professional description
            skills: data.skills, // Moved from profiles table
            years_experience: data.yearsExperience || 0,
            hourly_rate: data.hourlyRate,
            whatsapp_phone: data.whatsappPhone,
            is_active: true, // Default to active
            accepts_new_clients: true, // Default to accepting clients
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

      if (professionalError) {
        return NextResponse.json(
          { error: professionalError.message },
          { status: 400 }
        );
      }

      // If work zone is specified, look up the UUID and save it to professional_work_zones
      if (data.workZone && professionalProfile) {
        // Si workZone es un UUID, usarlo directamente. Si no, buscarlo por nombre.
        let workZoneId = data.workZone;

        if (!isValidUUID(data.workZone)) {
          // Buscar el work_zone por nombre
          const { data: workZoneData } = await supabase
            .from("work_zones")
            .select("id")
            .eq("name", data.workZone)
            .single();

          if (workZoneData) {
            workZoneId = workZoneData.id;
          }
        }

        if (workZoneId && isValidUUID(workZoneId)) {
          const { error: workZoneError } = await supabase
            .from("professional_work_zones")
            .upsert({
              professional_profile_id: professionalProfile.id,
              work_zone_id: workZoneId,
            });

          if (workZoneError) {
            console.error("Error saving work zone:", workZoneError);
            // Don't fail the whole request for work zone errors
          }
        }
      }
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
