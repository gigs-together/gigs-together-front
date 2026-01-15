'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { toast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Script from 'next/script';
import { apiRequest } from '@/lib/api';

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Date must be in YYYY-MM-DD format.',
  }),
  location: z.string().min(2, {
    message: 'Please enter location.',
  }),
  ticketsUrl: z.string().url({
    message: 'Please enter a valid ticket URL.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function GigForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [photoMode, setPhotoMode] = useState<'upload' | 'url'>('upload');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      date: '',
      location: '',
      ticketsUrl: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    try {
      const telegramInitDataString = window.Telegram?.WebApp?.initData ?? '';

      if (photoMode === 'upload' && photoFile) {
        // Backend expects: FileInterceptor('photo') + @Body()
        const fd = new FormData();
        fd.append('photo', photoFile);
        // Send body as string fields (Nest multer parses multipart fields as strings)
        fd.append('gig', JSON.stringify(values));
        fd.append('telegramInitDataString', telegramInitDataString);
        await apiRequest<void, FormData>('v1/receiver/gig', 'POST', fd);
      } else if (photoMode === 'url') {
        const trimmed = photoUrl.trim();
        try {
          // Validate URL format
           
          new URL(trimmed);
        } catch {
          toast({
            title: 'Invalid photo URL',
            description: 'Please paste a valid image URL.',
            variant: 'destructive',
          });
          return;
        }

        const data = {
          gig: { ...values, photo: trimmed },
          telegramInitDataString,
        };
        await apiRequest('v1/receiver/gig', 'POST', data);
      } else {
        const data = { gig: values, telegramInitDataString };
        await apiRequest('v1/receiver/gig', 'POST', data);
      }

      toast({
        title: 'Gig submitted',
        description: (
          <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white">{JSON.stringify(values, null, 2)}</code>
          </pre>
        ),
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: 'There was an error submitting the form.',
        variant: 'destructive',
      });
      console.error(e);
    } finally {
      setIsSubmitting(false);
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Gig title" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>Enter the title of a gig.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>Select the date of a gig.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Location" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>Enter location for a gig.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticketsUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Ticket URL" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormDescription>Enter the URL where tickets can be purchased.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <div className="space-y-2">
                  <FormDescription>Photo (optional)</FormDescription>
                  <ToggleGroup
                    type="single"
                    value={photoMode}
                    onValueChange={(v) => {
                      const next = (v as 'upload' | 'url') || photoMode;
                      setPhotoMode(next);
                      if (next === 'upload') {
                        setPhotoUrl('');
                      } else {
                        setPhotoFile(null);
                      }
                    }}
                    className="justify-start"
                  >
                    <ToggleGroupItem type="button" value="upload" aria-label="Upload photo">
                      Upload
                    </ToggleGroupItem>
                    <ToggleGroupItem type="button" value="url" aria-label="Use photo URL">
                      URL
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
                <FormControl>
                  {photoMode === 'upload' ? (
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
                    />
                  ) : (
                    <Input
                      type="url"
                      placeholder="https://example.com/photo.jpg"
                      value={photoUrl ?? ''}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                    />
                  )}
                </FormControl>
                <FormDescription>
                  {photoMode === 'upload'
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
