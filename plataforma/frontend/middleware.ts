import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de autenticación para FanFest AI.
 *
 * Rutas públicas:  /  /login  /dashboard  (demo)
 * Rutas protegidas: /app/*  — requieren sesión activa de Supabase Auth.
 *
 * El middleware refresca la sesión en cada request y redirige a /login
 * si el usuario no está autenticado y trata de acceder a /app/*.
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT add logic between createServerClient and getUser.
  // A bug here could make it hard to debug auth issues.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Protect /app/* routes — redirect to /login if not authenticated
  if (pathname.startsWith('/app') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If logged-in user visits /login, redirect to their dashboard
  if (pathname === '/login' && user) {
    const appUrl = request.nextUrl.clone();
    appUrl.pathname = '/app/dashboard';
    return NextResponse.redirect(appUrl);
  }

  // Protect /app/admin/* routes - verify if user is admin
  if (pathname.startsWith('/app/admin') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/app/dashboard';
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
