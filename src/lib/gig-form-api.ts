import { apiRequest } from '@/lib/api';

export type PosterMode = 'upload' | 'url';

export interface PosterSelection {
  mode: PosterMode;
  file: File | null;
  url: string;
}

export interface GigUpsertPayload {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
}

export interface GigForEditData {
  publicId: string;
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
}

export interface GigLookupData {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function requireString(obj: Record<string, unknown>, key: string): string {
  const v = obj[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Invalid API response: "${key}" must be a non-empty string`);
  }
  return v;
}

function optionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  if (v === undefined || v === null || v === '') return undefined;
  if (typeof v !== 'string') {
    throw new Error(`Invalid API response: "${key}" must be a string when present`);
  }
  return v;
}

function parseGigLookupData(raw: unknown): GigLookupData {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return {
    title: requireString(raw, 'title'),
    date: requireString(raw, 'date'),
    endDate: optionalString(raw, 'endDate'),
    city: requireString(raw, 'city'),
    country: requireString(raw, 'country'),
    venue: requireString(raw, 'venue'),
    ticketsUrl: requireString(raw, 'ticketsUrl'),
    posterUrl: optionalString(raw, 'posterUrl'),
  };
}

function parseGigForEditData(raw: unknown): GigForEditData {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return {
    publicId: requireString(raw, 'publicId'),
    title: requireString(raw, 'title'),
    date: requireString(raw, 'date'),
    endDate: optionalString(raw, 'endDate'),
    city: requireString(raw, 'city'),
    country: requireString(raw, 'country'),
    venue: requireString(raw, 'venue'),
    ticketsUrl: requireString(raw, 'ticketsUrl'),
    posterUrl: optionalString(raw, 'posterUrl'),
  };
}

function maybePosterUrl(poster: PosterSelection): string | undefined {
  if (poster.mode !== 'url') return undefined;
  const trimmed = (poster.url ?? '').trim();
  if (!trimmed) return undefined;
  // Validate URL format
  new URL(trimmed);
  return trimmed;
}

function buildGigBody(values: GigUpsertPayload): GigUpsertPayload {
  return {
    title: values.title,
    date: values.date,
    endDate: values.endDate || undefined,
    city: values.city,
    country: values.country,
    venue: values.venue,
    ticketsUrl: values.ticketsUrl,
  };
}

async function submitGig(params: {
  endpoint: string;
  method: 'POST' | 'PATCH';
  telegramInitDataString: string;
  gig: GigUpsertPayload;
  poster: PosterSelection;
}): Promise<void> {
  const gig = buildGigBody(params.gig);

  const hasPosterUpload = params.poster.mode === 'upload' && !!params.poster.file;
  const posterUrl = maybePosterUrl(params.poster);

  if (hasPosterUpload) {
    const fd = new FormData();
    fd.append('posterFile', params.poster.file as File);
    fd.append('gig', JSON.stringify(gig));
    fd.append('telegramInitDataString', params.telegramInitDataString);
    await apiRequest<void, FormData>(params.endpoint, params.method, fd);
    return;
  }

  if (posterUrl) {
    await apiRequest(params.endpoint, params.method, {
      gig: { ...gig, posterUrl },
      telegramInitDataString: params.telegramInitDataString,
    });
    return;
  }

  await apiRequest(params.endpoint, params.method, {
    gig,
    telegramInitDataString: params.telegramInitDataString,
  });
}

export async function fetchGigForEdit(params: {
  publicId: string;
  telegramInitDataString: string;
  signal?: AbortSignal;
}): Promise<GigForEditData> {
  const raw = await apiRequest<unknown>(
    'v1/receiver/gig/get',
    'POST',
    {
      publicId: params.publicId,
      telegramInitDataString: params.telegramInitDataString,
    },
    { signal: params.signal },
  );
  return parseGigForEditData(raw);
}

export async function lookupGig(params: {
  name: string;
  location: string;
  signal?: AbortSignal;
}): Promise<GigLookupData> {
  const name = params.name.trim();
  const location = params.location.trim();
  if (!name) {
    throw new Error('Invalid lookup request: "name" is required');
  }
  if (!location) {
    throw new Error('Invalid lookup request: "location" is required');
  }
  const raw = await apiRequest<unknown>(
    'v1/gig/lookup',
    'POST',
    {
      name,
      location,
    },
    { signal: params.signal },
  );
  return parseGigLookupData(raw);
}

export async function createGig(params: {
  telegramInitDataString: string;
  gig: GigUpsertPayload;
  poster: PosterSelection;
}): Promise<void> {
  return submitGig({
    endpoint: 'v1/receiver/gig',
    method: 'POST',
    telegramInitDataString: params.telegramInitDataString,
    gig: params.gig,
    poster: params.poster,
  });
}

export async function updateGig(params: {
  publicId: string;
  telegramInitDataString: string;
  gig: GigUpsertPayload;
  poster: PosterSelection;
}): Promise<void> {
  return submitGig({
    endpoint: `v1/receiver/gig/${encodeURIComponent(params.publicId)}`,
    method: 'PATCH',
    telegramInitDataString: params.telegramInitDataString,
    gig: params.gig,
    poster: params.poster,
  });
}
