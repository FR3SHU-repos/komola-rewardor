import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function isTransientAuthError(error: { name?: string; message?: string } | null): boolean {
  return Boolean(error && (error.name === "AuthRetryableFetchError" || /network|fetch|timeout/i.test(error.message ?? "")));
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  if (!URL || !KEY) return response;

  const { pathname } = request.nextUrl;
  if (pathname === "/login" || pathname === "/register" || pathname.startsWith("/auth/") || pathname.startsWith("/api/")) return response;

  const supabase = createServerClient(URL, KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (!user && isTransientAuthError(authError)) return response;
  if (!user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(login);
  }
  return response;
}
