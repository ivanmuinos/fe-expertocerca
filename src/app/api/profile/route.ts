import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "full_name, phone, whatsapp_phone, avatar_url, location_city, location_province"
      )
      .eq("user_id", user.id)
      .maybeSingle();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const { phone, whatsapp_phone, avatar_url } = body || {};

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof phone === "string") updates.phone = phone;
    if (typeof whatsapp_phone === "string")
      updates.whatsapp_phone = whatsapp_phone;
    if (typeof avatar_url === "string") updates.avatar_url = avatar_url;

    if (Object.keys(updates).length === 1) {
      return NextResponse.json({ data: { updated: false } });
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data: { updated: true } });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
