import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";
import { profileUpdateSchema } from "@/src/shared/lib/validation";

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
        "full_name, phone, whatsapp_phone, avatar_url, location_city, location_province, facebook_url, instagram_url, linkedin_url, twitter_url, website_url"
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

    // Validate input with Zod
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { phone, whatsapp_phone, avatar_url, facebook_url, instagram_url, linkedin_url, twitter_url, website_url } = validation.data;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (phone !== undefined) updates.phone = phone;
    if (whatsapp_phone !== undefined) updates.whatsapp_phone = whatsapp_phone;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (facebook_url !== undefined) updates.facebook_url = facebook_url || null;
    if (instagram_url !== undefined) updates.instagram_url = instagram_url || null;
    if (linkedin_url !== undefined) updates.linkedin_url = linkedin_url || null;
    if (twitter_url !== undefined) updates.twitter_url = twitter_url || null;
    if (website_url !== undefined) updates.website_url = website_url || null;

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
