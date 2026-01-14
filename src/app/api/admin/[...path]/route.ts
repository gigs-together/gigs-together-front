import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Proxy for React Admin backend.
 *
 * Configure `ADMIN_API_BASE_URL` to point to your backend admin base path, e.g.
 * - https://api.example.com/v1/admin
 * - http://localhost:3001/admin
 *
 * Then React Admin calls:
 * - /api/admin/events?...  ->  {ADMIN_API_BASE_URL}/events?...
 * - /api/admin/users/123   ->  {ADMIN_API_BASE_URL}/users/123
 */
const ADMIN_API_BASE_URL = process.env.ADMIN_API_BASE_URL;

interface RouteParams {
  params: Promise<{
    path: string[];
  }>;
}

export async function GET(req: NextRequest, context: RouteParams) {
  return handleProxy(req, context);
}
export async function POST(req: NextRequest, context: RouteParams) {
  return handleProxy(req, context);
}
export async function PUT(req: NextRequest, context: RouteParams) {
  return handleProxy(req, context);
}
export async function PATCH(req: NextRequest, context: RouteParams) {
  return handleProxy(req, context);
}
export async function DELETE(req: NextRequest, context: RouteParams) {
  return handleProxy(req, context);
}

async function handleProxy(req: NextRequest, { params }: RouteParams) {
  if (!ADMIN_API_BASE_URL) {
    return NextResponse.json(
      { message: 'Missing ADMIN_API_BASE_URL (required for /api/admin/* proxy)' },
      { status: 500 },
    );
  }

  const { path } = await params;
  const backendPath = path.join('/');
  const url = new URL(req.url);
  const targetUrl = `${ADMIN_API_BASE_URL.replace(/\/$/, '')}/${backendPath}${url.search}`;

  try {
    // Forward body for non-GET/HEAD if present
    let body: BodyInit | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const contentType = req.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        body = JSON.stringify(await req.json());
      } else {
        body = await req.arrayBuffer();
      }
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body,
    });

    // Stream response through, preserving headers (including X-Total-Count)
    return new NextResponse(response.body, {
      headers: response.headers,
      status: response.status,
      statusText: response.statusText,
    });
  } catch (e) {
    console.error('Admin Proxy Error:', e);
    return NextResponse.json({ message: 'Admin Proxy Error', error: e }, { status: 500 });
  }
}
