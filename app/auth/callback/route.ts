import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  const nextValue = url.searchParams.get("next");
  const next = nextValue && nextValue.startsWith("/") && !nextValue.startsWith("//") && !nextValue.includes("://") ? nextValue : "/";
  const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!code || !supabaseURL || !supabaseKey) return NextResponse.redirect(new URL(`/login?error=auth_callback&next=${encodeURIComponent(next)}`, request.url));

  let response = NextResponse.redirect(new URL(next, request.url));
  const supabase = createServerClient(supabaseURL, supabaseKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) response = NextResponse.redirect(new URL(`/login?error=auth_callback&next=${encodeURIComponent(next)}`, request.url));
  return response;
}
