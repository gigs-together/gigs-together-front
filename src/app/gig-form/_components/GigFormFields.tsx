'use client';

import type { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Country } from '@/lib/countries.server';
import { useT } from '@/lib/i18n/I18nProvider';
import type { GigFormValues } from '@/app/gig-form/gig-form.shared';
import { defaultGigFormValues } from '@/app/gig-form/gig-form.shared';

interface GigFormFieldsProps {
  form: UseFormReturn<GigFormValues>;
  countries: Country[];
  isLookingUp: boolean;
  isSubmitting: boolean;
  isLoading?: boolean;
  onLookup: () => void;
}

export default function GigFormFields({
  form,
  countries,
  isLookingUp,
  isSubmitting,
  isLoading,
  onLookup,
}: GigFormFieldsProps) {
  const t = useT();

  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title:</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Arctic Monkeys" {...field} value={field.value ?? ''} />
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
                  value={field.value ?? defaultGigFormValues.country}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                >
                  {countries.map((country) => (
                    <option key={country.iso} value={country.iso}>
                      {t('country', country.iso)}
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
          disabled={isLookingUp || isSubmitting || !!isLoading}
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
        name="endDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>End Date: (optional)</FormLabel>
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
    </>
  );
}
