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

export interface GigDraftData {
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
}

export interface GigForEditData extends GigDraftData {
  publicId: string;
}

export interface GigLookupData {
  title?: string;
  date?: string;
  endDate?: string;
  city?: string;
  country?: string;
  venue?: string;
  ticketsUrl?: string;
  posterUrl?: string;
}

export interface UpdateGigResponse {
  publicId: string;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

function asRecordOrThrow(raw: unknown): Record<string, unknown> {
  if (!isRecord(raw)) {
    throw new Error('Invalid API response: expected an object');
  }
  return raw;
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

function optionalNonEmptyString(obj: Record<string, unknown>, key: string): string | undefined {
  const v = obj[key];
  if (v === undefined || v === null) return undefined;
  if (typeof v !== 'string') {
    throw new Error(`Invalid API response: "${key}" must be a string when present`);
  }
  const trimmed = v.trim();
  return trimmed ? trimmed : undefined;
}

function parseGigDraftData(raw: unknown): GigDraftData {
  const obj = asRecordOrThrow(raw);
  return {
    title: requireString(obj, 'title'),
    date: requireString(obj, 'date'),
    endDate: optionalString(obj, 'endDate'),
    city: requireString(obj, 'city'),
    country: requireString(obj, 'country'),
    venue: requireString(obj, 'venue'),
    ticketsUrl: requireString(obj, 'ticketsUrl'),
    posterUrl: optionalString(obj, 'posterUrl'),
  };
}

function parseGigForEditData(raw: unknown): GigForEditData {
  const obj = asRecordOrThrow(raw);
  const draft = parseGigDraftData(obj);
  return {
    publicId: requireString(obj, 'publicId'),
    ...draft,
  };
}

function parseGigLookupData(raw: unknown): GigLookupData {
  const obj = asRecordOrThrow(raw);
  return {
    title: optionalNonEmptyString(obj, 'title'),
    date: optionalNonEmptyString(obj, 'date'),
    endDate: optionalNonEmptyString(obj, 'endDate'),
    city: optionalNonEmptyString(obj, 'city'),
    country: optionalNonEmptyString(obj, 'country'),
    venue: optionalNonEmptyString(obj, 'venue'),
    ticketsUrl: optionalNonEmptyString(obj, 'ticketsUrl'),
    posterUrl: optionalNonEmptyString(obj, 'posterUrl'),
  };
}

function getPosterUrlOrUndefined(poster: PosterSelection): string | undefined {
  if (poster.mode !== 'url') return undefined;
  const trimmed = (poster.url ?? '').trim();
  if (!trimmed) return undefined;
  // Validate URL format (throws on invalid URLs)
  new URL(trimmed);
  return trimmed;
}

type SubmitGigMethod = 'POST' | 'PATCH';

async function submitGig<TResponse = void>(params: {
  endpoint: string;
  method: SubmitGigMethod;
  telegramInitDataString: string;
  gig: GigUpsertPayload;
  poster: PosterSelection;
}): Promise<TResponse> {
  const gig: GigUpsertPayload = {
    title: params.gig.title,
    date: params.gig.date,
    endDate: params.gig.endDate || undefined,
    city: params.gig.city,
    country: params.gig.country,
    venue: params.gig.venue,
    ticketsUrl: params.gig.ticketsUrl,
  };

  const posterUrl = getPosterUrlOrUndefined(params.poster);

  if (params.poster.mode === 'upload' && params.poster.file) {
    const posterFile = params.poster.file;
    const fd = new FormData();
    fd.append('posterFile', posterFile);
    fd.append('gig', JSON.stringify(gig));
    fd.append('telegramInitDataString', params.telegramInitDataString);
    return apiRequest<TResponse, FormData>(params.endpoint, params.method, fd);
  }

  if (posterUrl) {
    return apiRequest<TResponse>(params.endpoint, params.method, {
      gig: { ...gig, posterUrl },
      telegramInitDataString: params.telegramInitDataString,
    });
  }

  return apiRequest<TResponse>(params.endpoint, params.method, {
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
  const raw = await apiRequest<{ gig: unknown }>(
    'v1/gig/lookup',
    'POST',
    {
      name,
      location,
    },
    { signal: params.signal },
  );
  return parseGigLookupData(raw?.gig);
}

export async function createGig(params: {
  telegramInitDataString: string;
  gig: GigUpsertPayload;
  poster: PosterSelection;
}): Promise<void> {
  await submitGig<void>({
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
}): Promise<UpdateGigResponse> {
  return submitGig<UpdateGigResponse>({
    endpoint: `v1/receiver/gig/${encodeURIComponent(params.publicId)}`,
    method: 'PATCH',
    telegramInitDataString: params.telegramInitDataString,
    gig: params.gig,
    poster: params.poster,
  });
}
