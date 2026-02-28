declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe?: {
          start_param?: string;
        };
      };
    };
  }
}

export type Event = {
  id: string;
  date: string;
  endDate?: string;
  poster?: string;
  title: string;
  venue: string;
  city: string;
  country: {
    iso: string;
    name: string;
  };
  ticketsUrl?: string;
  calendarUrl?: string;
  postUrl?: string;
};

export interface V1GigGetResponseBody {
  gigs: V1GigGetResponseBodyGig[];
}

export interface V1GigGetResponseBodyGig {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
  calendarUrl?: string;
  postUrl?: string;
}

export type Language = 'en' | 'ru' | 'es' | string;

export {};
