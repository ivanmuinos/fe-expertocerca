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
    const { rating, comment } = body;

    // Verify ownership
    const { data: review } = await supabase
      .from("reviews")
      .select("reviewer_user_id")
      .eq("id", id)
      .single();

    if (!review || review.reviewer_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update review
    const { data, error } = await supabase
      .from("reviews")
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating review:", error);
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

export async function DELETE(request: NextRequest, { params }: Context) {
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

    // Verify ownership
    const { data: review } = await supabase
      .from("reviews")
      .select("reviewer_user_id")
      .eq("id", id)
      .single();

    if (!review || review.reviewer_user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete review
    const { error } = await supabase.from("reviews").delete().eq("id", id);

    if (error) {
      console.error("Error deleting review:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
