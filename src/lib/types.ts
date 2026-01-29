declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
      };
    };
  }
}

export type Event = {
  id: string;
  date: string;
  poster?: string;
  title: string;
  venue: string;
  city: string;
  country: {
    code: string;
    name: string;
  };
  ticketsUrl?: string;
  calendarUrl?: string;
};

export interface V1GigGetResponseBody {
  gigs: V1GigGetResponseBodyGig[];
}

export interface V1GigGetResponseBodyGig {
  title: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  ticketsUrl: string;
  posterUrl?: string;
  calendarUrl?: string;
}

export {};
