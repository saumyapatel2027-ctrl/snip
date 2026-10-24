import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Email confirmation / magic-link landing. Exchanges the code for a session. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      const dest =
        next && next.startsWith("/") ? next : profile?.role === "designer" ? "/dashboard/profile?welcome=1" : profile?.role === "admin" ? "/admin" : "/discover";
      return NextResponse.redirect(new URL(dest, origin));
    }
  }
  return NextResponse.redirect(new URL("/login?error=That+link+has+expired.+Please+log+in.", origin));
}
