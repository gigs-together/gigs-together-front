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
import { fetchGigForEdit, lookupGig, updateGig } from '@/lib/gig-form-api';
import { waitForTelegramInitData } from '@/lib/telegram-webapp';
import { dateToYMD, defaultGigFormValues, gigFormSchema } from '@/app/gig-form/gig-form.shared';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';

interface EditGigFormClientProps {
  countries: Country[];
  gigPublicId: string;
}

export default function EditGigFormClient({ countries, gigPublicId }: EditGigFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [isLoadingGig, setIsLoadingGig] = useState<boolean>(false);
  const [loadGigError, setLoadGigError] = useState<string | null>(null);
  const [isPrefilled, setIsPrefilled] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [posterMode, setPosterMode] = useState<'upload' | 'url'>('upload');
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>('');
  const [existingPosterUrl, setExistingPosterUrl] = useState<string>('');
  const posterFileInputRef = useRef<HTMLInputElement | null>(null);
  const loadedGigRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestSeqRef = useRef<number>(0);

  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigFormSchema),
    defaultValues: defaultGigFormValues,
  });

  useEffect(() => {
    if (!gigPublicId) return;
    if (loadedGigRef.current === gigPublicId) return;

    setIsPrefilled(false);
    const ac = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ac;
    const seq = (requestSeqRef.current += 1);
    const timeoutId = window.setTimeout(() => {
      ac.abort();
    }, 15_000);

    const run = async () => {
      if (seq === requestSeqRef.current) {
        setIsLoadingGig(true);
        setLoadGigError(null);
      }
      try {
        const telegramInitDataString = await waitForTelegramInitData({ signal: ac.signal });

        const data = await fetchGigForEdit({
          publicId: gigPublicId,
          telegramInitDataString,
          signal: ac.signal,
        });

        const ymd = dateToYMD(data.date);
        if (!ymd) {
          throw new Error('Invalid API response: "gig.date" must be YYYY-MM-DD (or ISO)');
        }
        const ymd2 = data.endDate ? dateToYMD(data.endDate) : undefined;
        if (data.endDate && !ymd2) {
          throw new Error('Invalid API response: "gig.endDate" must be YYYY-MM-DD (or ISO)');
        }
        if (ac.signal.aborted) return;

        form.reset({
          ...defaultGigFormValues,
          title: data.title,
          date: ymd,
          endDate: ymd2 ?? '',
          city: data.city,
          country: data.country.toUpperCase(),
          venue: data.venue,
          ticketsUrl: data.ticketsUrl,
        });

        setExistingPosterUrl(data.posterUrl ?? '');
        loadedGigRef.current = gigPublicId;
        if (seq === requestSeqRef.current) {
          setIsPrefilled(true);
        }
      } catch (e) {
        if (ac.signal.aborted) {
          return;
        }
        const message =
          e instanceof Error ? e.message : 'There was an error loading gig data for editing.';
        if (seq === requestSeqRef.current) {
          setLoadGigError(message);
          setIsPrefilled(false);
        }
        toast({
          title: 'Couldn’t load gig',
          description: message,
          variant: 'destructive',
        });
        console.error(e);
      } finally {
        window.clearTimeout(timeoutId);
        if (abortRef.current === ac) abortRef.current = null;
        if (seq === requestSeqRef.current) {
          setIsLoadingGig(false);
        }
      }
    };

    void run();
    return () => {
      window.clearTimeout(timeoutId);
      ac.abort();
    };
  }, [form, gigPublicId, reloadKey]);

  function clearPosterFileInput() {
    setPosterFile(null);
    if (posterFileInputRef.current) {
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

      await updateGig({
        publicId: gigPublicId,
        telegramInitDataString,
        gig,
        poster: { mode: posterMode, file: posterFile, url: posterUrl },
      });

      toast({
        title: 'Updated!',
        description: 'Gig was updated.',
      });

      clearPosterFileInput();
      setPosterUrl('');
      setPosterMode('upload');
      router.back();
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

      const ymd = dateToYMD(data.date);
      if (!ymd) {
        throw new Error('Invalid API response: "gig.date" must be YYYY-MM-DD (or ISO)');
      }
      const ymd2 = data.endDate ? dateToYMD(data.endDate) : undefined;
      if (data.endDate && !ymd2) {
        throw new Error('Invalid API response: "gig.endDate" must be YYYY-MM-DD (or ISO)');
      }

      form.setValue('title', data.title, { shouldDirty: true });
      form.setValue('date', ymd, { shouldDirty: true });
      form.setValue('endDate', ymd2 ?? '', { shouldDirty: true });
      form.setValue('city', data.city, { shouldDirty: true });
      form.setValue('country', data.country.toUpperCase(), { shouldDirty: true });
      form.setValue('venue', data.venue, { shouldDirty: true });
      form.setValue('ticketsUrl', data.ticketsUrl, { shouldDirty: true });

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
      {!isPrefilled ? (
        <Card className="w-full max-w-md m-auto border-0">
          <CardHeader>
            <CardTitle>Edit gig</CardTitle>
            <CardDescription>
              {loadGigError ? `Error: ${loadGigError}` : isLoadingGig ? 'Loading…' : 'Loading…'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadGigError ? (
              <Button type="button" variant="secondary" onClick={() => setReloadKey((x) => x + 1)}>
                Retry
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <Card className="w-full max-w-md m-auto border-0">
          <CardHeader>
            <CardTitle>Edit gig</CardTitle>
            <CardDescription>Update gig details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <GigFormFields
                  form={form}
                  countries={countries}
                  isLookingUp={isLookingUp}
                  isSubmitting={isSubmitting}
                  isLoading={isLoadingGig}
                  onLookup={onLookup}
                />

                <PosterField
                  variant="edit"
                  mode={posterMode}
                  onModeChange={setPosterMode}
                  posterFile={posterFile}
                  onPosterFileChange={setPosterFile}
                  posterUrl={posterUrl}
                  onPosterUrlChange={setPosterUrl}
                  onClearPosterFile={clearPosterFileInput}
                  posterFileInputRef={posterFileInputRef}
                  existingPosterUrl={existingPosterUrl}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting || isLoadingGig || !gigPublicId}
                  style={{ width: '100%' }}
                >
                  {isSubmitting ? 'Submitting...' : 'Save changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </>
  );
}
