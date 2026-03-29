import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const USER = process.env.BASIC_AUTH_USER || 'test';
const PASS = process.env.BASIC_AUTH_PASS || '1234';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/api/auth/is-admin' || pathname.startsWith('/api/auth/is-admin/')) {
    return NextResponse.next();
  }

  const auth = req.headers.get('authorization');

  if (!auth || !auth.startsWith('Basic ')) {
    return new Response('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Protected"',
      },
    });
  }

  const base64Credentials = auth.split(' ')[1];
  const [user, pass] = atob(base64Credentials).split(':');

  if (user === USER && pass === PASS) {
    return NextResponse.next();
  }

  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Protected"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt).*)'],
};
