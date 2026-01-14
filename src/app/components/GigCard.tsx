import React from 'react';
import { FaUsers } from 'react-icons/fa';
import type { Event } from '@/types';

type CardProps = {
  gig: Event;
};

export function Card({ gig }: CardProps) {
  const href = gig.ticketsUrl || undefined;

  return (
    <div className="flex flex-col bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {gig.cover ? (
        <a
          href={href}
          target={href ? '_blank' : undefined}
          rel={href ? 'noopener noreferrer' : undefined}
        >
          <img className="rounded-lg aspect-[5/3] object-cover" src={gig.cover} alt={gig.title} />
        </a>
      ) : (
        <div className="rounded-lg aspect-[5/3] bg-gray-100 dark:bg-gray-700" aria-hidden />
      )}
      <div className="p-2">
        <div className="flex flex-row gap-4 items-center">
          <a
            href={href}
            target={href ? '_blank' : undefined}
            rel={href ? 'noopener noreferrer' : undefined}
            className={href ? '' : 'pointer-events-none'}
          >
            <span className="mb-2 tracking-tight dark:text-white font-bold">{gig.title}</span>
          </a>
          <div className="flex-1"></div>
          {Number.isFinite(gig.people) && gig.people > 0 ? (
            <p className="text-sm flex flex-row items-center gap-1">
              <FaUsers />
              {gig.people}
            </p>
          ) : null}
        </div>
        <div className="flex flex-row gap-2 items-center text-gray-500">{gig.venueAddress}</div>
      </div>
    </div>
  );
}
