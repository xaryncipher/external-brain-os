import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // If env not set (placeholders), let /login render with its friendly error instead of crashing
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isPlaceholder = !url || !key || url.includes("YOUR_PROJECT") || key.includes("YOUR_ANON");

  if (!isPlaceholder) {
    const supabase = createServerClient(url!, key!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isLogin = request.nextUrl.pathname === "/login";
    const isPublicAsset =
      request.nextUrl.pathname.startsWith("/_next") ||
      request.nextUrl.pathname === "/favicon.ico" ||
      request.nextUrl.pathname.startsWith("/api");

    if (!user && !isLogin && !isPublicAsset) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user && isLogin) {
      return NextResponse.redirect(new URL("/today", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
