type HttpMethod = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function buildUrl(endpointOrUrl: string): string {
  // If caller already passed an absolute URL, use it as-is.
  if (/^https?:\/\//i.test(endpointOrUrl)) return endpointOrUrl;
  if (!API_BASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL for direct API calls');
  }
  return `${API_BASE_URL.replace(/\/$/, '')}/${endpointOrUrl.replace(/^\//, '')}`;
}

export async function apiRequest<TResponse = unknown, TBody = unknown>(
  endpointOrUrl: string,
  method: HttpMethod,
  data?: TBody,
): Promise<TResponse> {
  try {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;

    const response = await fetch(buildUrl(endpointOrUrl), {
      method,
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      body:
        method !== 'GET' && method !== 'HEAD' && data
          ? isFormData
            ? (data as unknown as FormData)
            : JSON.stringify(data)
          : undefined,
    });

    const contentType = response.headers.get('Content-Type') || '';
    const isJson = contentType.includes('application/json');

    const result = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      throw new Error(
        typeof result === 'string' ? result : result.message || 'Something went wrong',
      );
    }

    return result as TResponse;
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
}
