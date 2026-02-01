import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const DEFAULT_FEED_PATH = '/feed/es/barcelona';

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const { pathname, search } = nextUrl;

  // Allow the default page itself (avoid loops), including optional trailing slash.
  if (pathname === DEFAULT_FEED_PATH || pathname === `${DEFAULT_FEED_PATH}/`) {
    return NextResponse.next();
  }

  const url = nextUrl.clone();
  url.pathname = DEFAULT_FEED_PATH;
  url.search = search; // preserve query string
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/feed/:path*'],
};
