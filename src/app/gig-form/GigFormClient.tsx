'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Script from 'next/script';
import { apiRequest } from '@/lib/api';
import { Separator } from '@/components/ui/separator';
import { useCountries } from '@/app/_components/CountriesProvider';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format.',
  }),
  city: z.string().min(1, { message: 'City is required.' }),
  country: z.string().min(1, { message: 'Country is required.' }), // ISO code
  venue: z.string().min(2, { message: 'Please enter venue.' }),
  ticketsUrl: z.string().url({
    message: 'Please enter a valid ticket URL.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

type GigLookupResponse = {
  title?: string;
  date?: string;
  city?: string;
  country?: string;
  venue?: string;
  ticketsUrl?: string;
  // sometimes APIs wrap payloads ?
  gig?: GigLookupResponse;
};

function dateToYMD(date?: string): string | undefined {
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

export default function GigFormClient() {
  const { countriesList, countriesDictionary } = useCountries();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [posterMode, setPosterMode] = useState<'upload' | 'url'>('upload');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: '',
      city: 'Barcelona',
      country: 'ES',
      venue: '',
      ticketsUrl: '',
    },
  });

  function clearPosterFileInput() {
    setPosterFile(null);
    if (posterFileInputRef.current) {
      // Allows re-selecting the same file after submit/error
      posterFileInputRef.current.value = '';
    }
  }

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const telegramInitDataString = window.Telegram?.WebApp?.initData ?? '';

      const gig = {
        title: values.title,
        date: values.date,
        city: values.city,
        country: values.country,
        venue: values.venue,
        ticketsUrl: values.ticketsUrl,
      };

      if (posterMode === 'upload' && posterFile) {
        // Backend expects: FileInterceptor('posterFile') + @Body()
        const fd = new FormData();
        fd.append('posterFile', posterFile);
        // Send body as string fields (Nest multer parses multipart fields as strings)
        fd.append('gig', JSON.stringify(gig));
        fd.append('telegramInitDataString', telegramInitDataString);
        await apiRequest<void, FormData>('v1/receiver/gig', 'POST', fd);
      } else if (posterMode === 'url') {
        const trimmed = posterUrl.trim();
        try {
          // Validate URL format
          new URL(trimmed);
        } catch {
          toast({
            title: 'Invalid poster URL',
            description: 'Please paste a valid image URL.',
            variant: 'destructive',
          });
          return;
        }

        const data = {
          gig: { ...gig, posterUrl: trimmed },
          telegramInitDataString,
        };
        await apiRequest('v1/receiver/gig', 'POST', data);
      } else {
        const data = { gig, telegramInitDataString };
        await apiRequest('v1/receiver/gig', 'POST', data);
      }

      toast({
        title: 'Sent!',
        description: 'Thanks — we’ll review it and (hopefully) announce it soon.',
      });

      // Reset form for the next submission (keep location defaults)
      const currentCity = form.getValues('city') ?? 'Barcelona';
      const currentCountry = form.getValues('country') ?? 'ES';
      form.reset({
        title: '',
        date: '',
        city: currentCity,
        country: currentCountry,
        venue: '',
        ticketsUrl: '',
      });
      setPosterUrl('');
      clearPosterFileInput();
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === 'string'
            ? e
            : 'There was an error submitting the form.';
      toast({
        title: 'Couldn’t submit',
        description: message,
        variant: 'destructive',
      });
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onLookup() {
    if (isLookingUp) return;
    setIsLookingUp(true);
    try {
      const name = form.getValues('title')?.trim();
      const city = form.getValues('city')?.trim();
      const country = form.getValues('country')?.trim();
      const location = [city, countriesDictionary[country]].filter(Boolean).join(', ');
      const res = await apiRequest<GigLookupResponse>('v1/gig/lookup', 'POST', { name, location });
      const data: GigLookupResponse = res?.gig ?? res ?? {};

      if (data.title) form.setValue('title', data.title, { shouldDirty: true });
      const ymd = dateToYMD(data.date);
      if (ymd) form.setValue('date', ymd, { shouldDirty: true });

      if (data.city) form.setValue('city', data.city, { shouldDirty: true });
      if (data.country) form.setValue('country', data.country.toUpperCase(), { shouldDirty: true });

      if (data.venue) form.setValue('venue', data.venue, { shouldDirty: true });
      if (data.ticketsUrl) form.setValue('ticketsUrl', data.ticketsUrl, { shouldDirty: true });

      toast({ title: 'Filled from AI', description: 'Fields were updated from lookup results.' });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to start AI lookup.',
        variant: 'destructive',
      });
      console.error(e);
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js?56"
        // strategy="beforeInteractive"
        strategy="afterInteractive" // Load after hydration
        onLoad={() => {
          console.log('Telegram Web App script loaded.');
          // Optionally, initialize any features that depend on the script here.
        }}
      />
      <Card className="w-full max-w-md m-auto">
        <CardHeader>
          <CardTitle>Suggest a gig</CardTitle>
          <CardDescription>
            Looking for a gig company? Let us know which gig should we announce!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Arctic Monkeys"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country:</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? 'ES'}
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        >
                          {countriesList.map((c) => (
                            <option key={c.iso} value={c.iso}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City:</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Barcelona" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-center gap-3">
                <Separator className="flex-1" />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isLookingUp || isSubmitting}
                  onClick={onLookup}
                >
                  {isLookingUp ? 'Looking up…' : 'Find info with AI'}
                </Button>
                <Separator className="flex-1" />
              </div>

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date:</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue:</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Razzmatazz" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticketsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tickets URL:</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. https://www.ticketmaster.es/event/..."
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="space-y-2">
                  <div className="text-sm font-medium leading-none">Poster:</div>
                  <ToggleGroup
                    type="single"
                    value={posterMode}
                    onValueChange={(v) => {
                      const next = (v as 'upload' | 'url') || posterMode;
                      setPosterMode(next);
                      if (next === 'upload') {
                        setPosterUrl('');
                      } else {
                        clearPosterFileInput();
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem type="button" value="upload" aria-label="Upload poster">
                      Upload
                    </ToggleGroupItem>
                    <ToggleGroupItem type="button" value="url" aria-label="Use poster URL">
                      URL
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <FormControl>
                  {posterMode === 'upload' ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={posterFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPosterFile(e.target.files?.[0] ?? null)}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={clearPosterFileInput}
                        disabled={!posterFile}
                      >
                        Clear
                      </Button>
                    </div>
                  ) : (
                    <Input
                      type="url"
                      placeholder="e.g. https://example.com/poster.jpg"
                      value={posterUrl ?? ''}
                      onChange={(e) => setPosterUrl(e.target.value)}
                    />
                  )}
                </FormControl>
                <FormDescription>
                  {posterMode === 'upload'
                    ? 'Upload an image file (max 10MB).'
                    : 'Paste a direct image URL.'}
                </FormDescription>
              </FormItem>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Suggest'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
