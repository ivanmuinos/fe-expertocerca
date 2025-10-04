import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/config/supabase-server";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode"); // 'discover' or 'browse'

    // Check auth for browse mode
    if (mode === "browse") {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.json(
          {
            error: "Unauthorized - No valid session found",
            details: sessionError?.message,
          },
          {
            status: 401,
            headers: corsHeaders(),
          }
        );
      }
    }

    const rpcFunction =
      mode === "browse" ? "browse_professionals" : "discover_professionals";
    const { data, error } = await supabase.rpc(rpcFunction);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Use ONLY the column from professional_profiles; no fallback
    const professionals = (data as any[]) || [];

    return NextResponse.json(
      { data: professionals },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const body = await request.json();

    // Check how many profiles the user already has
    const { count, error: countError } = await supabase
      .from("professional_profiles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 400 });
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

    const { data, error } = await supabase
      .from("professional_profiles")
      .insert([
        {
          ...body,
          user_id: session.user.id,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    return NextResponse.json(
      { data: data[0] },
      {
        headers: corsHeaders(),
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}
