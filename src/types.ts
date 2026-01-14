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
  cover: string;
  title: string;
  people: number;
  venueAddress: string;
  published?: boolean;
  ticketmasterId?: string;
  ticketsUrl?: string;
};

export interface V1GigGetResponseBody {
  gigs: GigDto[];
  isLastPage: boolean;
}

export interface GigDto {
  title: string;
  date: string | number;
  location: string;
  ticketsUrl: string;
  photo?: { tgFileId?: string; url?: string };
}

export {};
