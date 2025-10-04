import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

interface Context {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { id } = await params;
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
    const { title, description } = body;

    // Verify ownership
    const { data: photo } = await supabase
      .from("portfolio_photos")
      .select("professional_profile_id")
      .eq("id", id)
      .single();

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Check if user owns the professional profile
    const { data: profile } = await supabase
      .from("professional_profiles")
      .select("user_id")
      .eq("id", photo.professional_profile_id)
      .single();

    if (!profile || profile.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update photo
    const { data, error } = await supabase
      .from("portfolio_photos")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating portfolio photo:", error);
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
