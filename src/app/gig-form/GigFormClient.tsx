'use client';

import type { Country } from '@/lib/countries.server';
import CreateGigFormClient from '@/app/gig-form/CreateGigFormClient';
import EditGigFormClient from '@/app/gig-form/EditGigFormClient';

interface GigFormClientProps {
  countries: Country[];
  mode?: 'create' | 'edit';
  gigPublicId?: string;
}

export default function GigFormClient({
  countries,
  mode = 'create',
  gigPublicId,
}: GigFormClientProps) {
  if (mode === 'edit') {
    if (!gigPublicId) {
      return <div className="p-4 text-sm text-red-600">Missing gigPublicId</div>;
    }
    return <EditGigFormClient countries={countries} gigPublicId={gigPublicId} />;
  }

  return <CreateGigFormClient countries={countries} />;
}
