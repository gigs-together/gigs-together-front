'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import type { Country } from '@/lib/countries.server';
import { useRouter } from 'next/navigation';
import TelegramWebAppScript from '@/app/gig-form/_components/TelegramWebAppScript';
import GigFormFields from '@/app/gig-form/_components/GigFormFields';
import PosterField from '@/app/gig-form/_components/PosterField';
import { createGig, lookupGig } from '@/lib/gig-form-api';
import { getTelegramStartParam, waitForTelegramInitData } from '@/lib/telegram-webapp';
import {
  dateToYMD,
  defaultGigFormValues,
  gigFormSchema,
  type GigFormValues,
} from '@/app/gig-form/gig-form.shared';

interface CreateGigFormClientProps {
  countries: Country[];
}

export default function CreateGigFormClient({ countries }: CreateGigFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [posterMode, setPosterMode] = useState<'upload' | 'url'>('upload');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: defaultGigFormValues,
  });

  useEffect(() => {
    // Telegram deep-link: https://t.me/<bot>/<app>?startapp=<token>
    // Telegram passes it as `start_param` in initDataUnsafe and also duplicates as `tgWebAppStartParam` in query.
    const token = getTelegramStartParam().trim();
    if (!token) return;
    // Keep token format aligned with backend publicId rules.
    if (!/^[a-z0-9-]{1,64}$/i.test(token)) return;
    router.replace(`/gig-form/${encodeURIComponent(token)}/edit`);
  }, [router]);

  function clearPosterFileInput() {
    setPosterFile(null);
    if (posterFileInputRef.current) {
      // Allows re-selecting the same file after submit/error
      posterFileInputRef.current.value = '';
    }
  }

  async function onSubmit(values: GigFormValues) {
    setIsSubmitting(true);
    try {
      const telegramInitDataString = await waitForTelegramInitData();

      const gig = {
        title: values.title,
        date: values.date,
        endDate: values.endDate || undefined,
        city: values.city,
        country: values.country,
        venue: values.venue,
        ticketsUrl: values.ticketsUrl,
      };

      if (posterMode === 'url' && posterUrl.trim()) {
        try {
          new URL(posterUrl.trim());
        } catch {
          toast({
            title: 'Invalid poster URL',
            description: 'Please paste a valid image URL.',
            variant: 'destructive',
          });
          return;
        }
      }

      await createGig({
        telegramInitDataString,
        gig,
        poster: { mode: posterMode, file: posterFile, url: posterUrl },
      });

      toast({
        title: 'Sent!',
        description: 'Thanks — we’ll review it and (hopefully) announce it soon.',
      });

      // Reset form for the next submission (keep location defaults)
      const currentCity = form.getValues('city') ?? defaultGigFormValues.city;
      const currentCountry = form.getValues('country') ?? defaultGigFormValues.country;
      form.reset({
        ...defaultGigFormValues,
        city: currentCity,
        country: currentCountry,
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
      const location = [city, country].filter(Boolean).join(', ');
      if (!name) {
        throw new Error('Lookup requires "title"');
      }
      if (!location) {
        throw new Error('Lookup requires "city" and "country"');
      }
      const data = await lookupGig({ name, location });

      if (!data.date) {
        throw new Error('AI lookup did not return a date');
      }
      const ymd = dateToYMD(data.date);
      if (!ymd) {
        throw new Error('Invalid API response: "gig.date" must be YYYY-MM-DD (or ISO)');
      }
      const ymd2 = data.endDate ? dateToYMD(data.endDate) : undefined;
      if (data.endDate && !ymd2) {
        throw new Error('Invalid API response: "gig.endDate" must be YYYY-MM-DD (or ISO)');
      }

      if (data.title) form.setValue('title', data.title, { shouldDirty: true });
      form.setValue('date', ymd, { shouldDirty: true });
      if (data.endDate) form.setValue('endDate', ymd2 ?? '', { shouldDirty: true });
      if (data.city) form.setValue('city', data.city, { shouldDirty: true });
      if (data.country) {
        form.setValue('country', data.country.toUpperCase(), { shouldDirty: true });
      }
      if (data.venue) form.setValue('venue', data.venue, { shouldDirty: true });
      if (data.ticketsUrl) {
        form.setValue('ticketsUrl', data.ticketsUrl, { shouldDirty: true });
      }

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
      <TelegramWebAppScript />
      <Card className="w-full max-w-md m-auto border-0">
        <CardHeader>
          <CardTitle>Suggest a gig</CardTitle>
          <CardDescription>
            Looking for a gig company? Let us know which gig should we announce!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <GigFormFields
                form={form}
                countries={countries}
                isLookingUp={isLookingUp}
                isSubmitting={isSubmitting}
                onLookup={onLookup}
              />

              <PosterField
                variant="create"
                mode={posterMode}
                onModeChange={setPosterMode}
                posterFile={posterFile}
                onPosterFileChange={setPosterFile}
                posterUrl={posterUrl}
                onPosterUrlChange={setPosterUrl}
                onClearPosterFile={clearPosterFileInput}
                posterFileInputRef={posterFileInputRef}
              />

              <Button type="submit" disabled={isSubmitting} style={{ width: '100%' }}>
                {isSubmitting ? 'Submitting...' : 'Suggest'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
