import { NextResponse, type NextRequest } from 'next/server';

const AUTOMATED_USER_AGENT = /bot|crawler|spider|scraper|slurp|bingpreview|facebookexternalhit|python-requests|python-urllib|wget|curl|go-http-client|headlesschrome|phantomjs|selenium/i;

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/robots.txt' || request.method === 'HEAD') {
    const response = NextResponse.next();
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return response;
  }

  const userAgent = request.headers.get('user-agent') || '';
  if (AUTOMATED_USER_AGENT.test(userAgent)) {
    return new NextResponse('Acesso automatizado não permitido.', {
      status: 403,
      headers: {
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow, noarchive, noimageindex, nosnippet',
      },
    });
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, noimageindex, nosnippet');

  if (request.nextUrl.pathname.startsWith('/img/') || request.nextUrl.pathname.startsWith('/audio/')) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static).*)'],
};
