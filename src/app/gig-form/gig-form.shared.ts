import * as z from 'zod';

export const gigFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format.',
  }),
  endDate: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'End Date must be in YYYY-MM-DD format.',
      })
      .optional(),
  ),
  city: z.string().min(1, { message: 'City is required.' }),
  country: z.string().min(1, { message: 'Country is required.' }), // ISO code
  venue: z.string().min(2, { message: 'Please enter venue.' }),
  ticketsUrl: z.string().url({
    message: 'Please enter a valid ticket URL.',
  }),
});

export type GigFormValues = z.infer<typeof gigFormSchema>;

export const defaultGigFormValues: GigFormValues = {
  title: '',
  date: '',
  endDate: '',
  city: 'Barcelona',
  country: 'ES',
  venue: '',
  ticketsUrl: '',
};

export function dateToYMD(date?: string): string | undefined {
  if (!date) return undefined;
  const s = String(date).trim();
  if (!s) return undefined;
  // ISO "2026-02-15T20:00:00+01:00"
  if (s.includes('T')) return s.slice(0, 10);
  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}
