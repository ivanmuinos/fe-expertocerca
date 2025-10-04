import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user has a profile
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type, onboarding_completed")
          .eq("user_id", session.user.id)
          .maybeSingle();

        // If no profile exists, redirect to onboarding user type selection
        if (!profile) {
          return NextResponse.redirect(
            `${origin}/onboarding/user-type-selection`
          );
        }

        // If profile exists but onboarding is incomplete for professionals
        if (
          profile.user_type === "professional" &&
          !profile.onboarding_completed
        ) {
          return NextResponse.redirect(`${origin}/onboarding`);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
