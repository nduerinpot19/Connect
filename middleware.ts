import { type NextRequest, NextResponse } from 'next/server'

// Middleware minimale: il refresh della sessione e i controlli di
// autenticazione sono gestiti direttamente nei Server Components
// (lib/supabase/server.ts), che girano in Node runtime.
// Qui evitiamo di importare @supabase/ssr per non avere problemi
// di bundling sull'Edge Runtime (es. "__dirname is not defined").
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}