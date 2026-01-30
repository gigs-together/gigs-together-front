import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes a location slug/name for display by:
 * - decoding URI components (if present)
 * - converting separators (`-` / `_`) to spaces
 * - Title Casing each word (first letter uppercase, rest lowercase)
 *
 * Examples:
 * - "barcelona" -> "Barcelona"
 * - "new-york" -> "New York"
 * - "SAN_SEBASTIAN" -> "San Sebastian"
 */
export function normalizeLocationTitle(location: string): string {
  if (!location) return '';

  let decoded = location;
  try {
    decoded = decodeURIComponent(location);
  } catch {
    // ignore malformed URI sequences; fall back to the raw value
  }

  const normalized = decoded.trim().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');

  if (!normalized) return '';

  return normalized
    .split(' ')
    .map((word) => {
      const lower = word.toLocaleLowerCase();
      const first = lower.charAt(0);
      if (!first) return word;
      return first.toLocaleUpperCase() + lower.slice(1);
    })
    .join(' ');
}

// Convert a Date (local time) or a YYYY-MM-DD string into a normalized YYYY-MM-DD string
export function toLocalYMD(d: Date | string): string {
  // If a Date is passed (e.g., from DayPicker) — use local date parts
  if (d instanceof Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  // If a "YYYY-MM-DD" string is passed — parse manually, without new Date(...) (to avoid timezone shifts)
  const [y, m, day] = d.split('-').map(Number);
  return `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
