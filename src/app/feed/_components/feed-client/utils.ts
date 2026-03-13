import type {
  V1GigAroundGetResponseBody,
  V1GigByPublicIdGetResponseBody,
  V1GigDatesGetResponseBody,
} from '@/lib/types';

const DEFAULT_LOCALE = 'en-US';

export const formatMonthTitle = (date: string): string => {
  return (
    new Date(date).toLocaleString(DEFAULT_LOCALE, { month: 'long' }) + ' ' + date.split('-')[0]
  );
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isV1GigDatesGetResponseBody(value: unknown): value is V1GigDatesGetResponseBody {
  if (!isRecord(value)) return false;
  const dates = value['dates'];
  if (!Array.isArray(dates)) return false;
  return dates.every((x) => typeof x === 'string' || typeof x === 'number');
}

export function isV1GigAroundGetResponseBody(value: unknown): value is V1GigAroundGetResponseBody {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value['before']) &&
    Array.isArray(value['after']) &&
    (value['prevCursor'] === undefined || typeof value['prevCursor'] === 'string') &&
    (value['nextCursor'] === undefined || typeof value['nextCursor'] === 'string')
  );
}

export function isV1GigByPublicIdGetResponseBody(
  value: unknown,
): value is V1GigByPublicIdGetResponseBody {
  if (!isRecord(value)) return false;
  const gig = value['gig'];
  if (!isRecord(gig)) return false;
  return typeof gig['id'] === 'string' && typeof gig['date'] === 'string';
}
