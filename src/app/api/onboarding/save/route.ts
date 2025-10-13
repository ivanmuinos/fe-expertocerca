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

    // Get current session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { data } = body;

    // Check if this is the first publication (onboarding) or an additional one
    const { count: existingProfilesCount } = await supabase
      .from("professional_profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    const isFirstPublication = !existingProfilesCount || existingProfilesCount === 0;

    // Only update profiles table on first publication (onboarding)
    // CRITICAL: This endpoint should ONLY be used during initial onboarding
    // For additional publications, use the /publicar page which doesn't touch profiles
    if (isFirstPublication) {
      // Double-check that onboarding is not already completed
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("user_id", session.user.id)
        .single();

      if (existingProfile?.onboarding_completed) {
        return NextResponse.json(
          {
            error: "Onboarding already completed. Use /publicar to create additional publications."
          },
          { status: 400 }
        );
      }

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
          // Social media URLs
          facebook_url: data.facebookUrl || null,
          instagram_url: data.instagramUrl || null,
          linkedin_url: data.linkedinUrl || null,
          twitter_url: data.twitterUrl || null,
          website_url: data.websiteUrl || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (profileError) {
        return NextResponse.json(
          { error: "Failed to save profile" },
          { status: 500 }
        );
      }
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
      console.log(
        "Attempting to insert professional profile for user:",
        session.user.id
      );
      console.log("Current count:", count);
      console.log("Profile data:", {
        user_id: session.user.id,
        specialty: data.specialty,
        trade_name: data.tradeName,
        description: data.bio,
        skills: data.skills,
        years_experience: data.yearsExperience || 0,
        hourly_rate: data.hourlyRate,
      });

      const { data: professionalProfile, error: professionalError } =
        await supabase
          .from("professional_profiles")
          .insert({
            user_id: session.user.id,
            specialty: data.specialty, // Required field - actual specialty value
            specialty_category: data.specialtyCategory || data.specialty, // Category for filtering
            trade_name: data.tradeName, // Required field
            description: data.bio, // Professional description
            skills: data.skills, // Moved from profiles table
            years_experience: data.yearsExperience || 0,
            hourly_rate: data.hourlyRate,
            whatsapp_phone: data.whatsappPhone,
            location_city: data.locationCity || null,
            location_province: data.locationProvince || null,
            is_active: true, // Default to active
            accepts_new_clients: true, // Default to accepting clients
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

      if (professionalError) {
        console.error("Professional profile error:", professionalError);
        return NextResponse.json(
          {
            error: "Failed to save professional profile",
            details: professionalError.message,
            code: professionalError.code,
          },
          { status: 500 }
        );
      }

      // If work zone is specified, look up the UUID and save it to professional_work_zones
      if (data.workZone && professionalProfile) {
        console.log("[WORK ZONE] Received workZone:", data.workZone);
        console.log(
          "[WORK ZONE] Professional profile ID:",
          professionalProfile.id
        );

        // Si workZone es un UUID, usarlo directamente. Si no, buscarlo por nombre.
        let workZoneId = data.workZone;

        if (!isValidUUID(data.workZone)) {
          console.log(
            "[WORK ZONE] Not a UUID, looking up by name:",
            data.workZone
          );

          // Buscar el work_zone por nombre
          const { data: workZoneData, error: lookupError } = await supabase
            .from("work_zones")
            .select("id")
            .eq("name", data.workZone)
            .single();

          console.log("[WORK ZONE] Lookup result:", {
            workZoneData,
            lookupError,
          });

          if (workZoneData) {
            workZoneId = workZoneData.id;
            console.log("[WORK ZONE] Found work zone ID:", workZoneId);
          } else {
            console.error(
              "[WORK ZONE] Could not find work zone with name:",
              data.workZone
            );
          }
        } else {
          console.log("[WORK ZONE] Using UUID directly:", workZoneId);
        }

        if (workZoneId && isValidUUID(workZoneId)) {
          console.log("[WORK ZONE] Saving to professional_work_zones:", {
            professional_profile_id: professionalProfile.id,
            work_zone_id: workZoneId,
          });

          const { error: workZoneError } = await supabase
            .from("professional_work_zones")
            .upsert({
              professional_profile_id: professionalProfile.id,
              work_zone_id: workZoneId,
            });

          if (workZoneError) {
            console.error("[WORK ZONE] Error saving work zone:", workZoneError);
            // Don't fail the whole request for work zone errors
          } else {
            console.log("[WORK ZONE] Successfully saved work zone!");
          }
        } else {
          console.error(
            "[WORK ZONE] Invalid or missing work zone ID:",
            workZoneId
          );
        }
      } else {
        console.log(
          "[WORK ZONE] Skipping - no workZone or no professionalProfile"
        );
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
