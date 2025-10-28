import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";
import { createModerationService } from "@/src/shared/lib/content-moderation";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file)
      return NextResponse.json({ error: "Missing file" }, { status: 400 });

    // Moderate image content
    const moderationService = createModerationService();
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    const decision = await moderationService.checkImage(imageBuffer);

    if (!decision.allowed) {
      return NextResponse.json(
        { error: decision.reason || "Imagen no permitida" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const path = `avatars/${session.user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("portfolio")
      .upload(path, file, { cacheControl: "3600", upsert: true });

    if (uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 400 });

    const {
      data: { publicUrl },
    } = supabase.storage.from("portfolio").getPublicUrl(path);

    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
