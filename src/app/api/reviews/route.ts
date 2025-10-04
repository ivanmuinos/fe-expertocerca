import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { professional_profile_id, rating, comment } = body;

    // Check if user is trying to review their own professional profile
    const { data: profile } = await supabase
      .from("professional_profiles")
      .select("user_id")
      .eq("id", professional_profile_id)
      .single();

    if (profile && profile.user_id === user.id) {
      return NextResponse.json(
        { error: "No puedes dejar reseñas en tu propia publicación" },
        { status: 400 }
      );
    }

    // Create review
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        professional_profile_id,
        reviewer_user_id: user.id,
        rating,
        comment,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating review:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
